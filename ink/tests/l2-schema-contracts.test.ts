import { describe, it, expect } from 'vitest';
import {
  PullRequestIdentitySchema,
  ReviewFindingSchema,
  ReviewReportSchema,
  SeveritySchema,
  CategorySchema,
  WorkerRoleSchema,
  WorkerStateSchema,
  FinalWorkerStateSchema,
  RunStatusSchema,
} from '../src/types/contracts.js';
import {
  SYNTHETIC_PR_IDENTITY,
  SYNTHETIC_FINDINGS,
  SYNTHETIC_REPORT,
  CANONICAL_SPECIALISTS,
} from '../src/fixtures/fixtures.js';

describe('L2 — Schema and Domain Unit Testing', () => {
  describe('PullRequestIdentitySchema', () => {
    it('validates canonical demo PR identity fixture', () => {
      const result = PullRequestIdentitySchema.safeParse(SYNTHETIC_PR_IDENTITY);
      expect(result.success).toBe(true);
    });

    it('enforces exact 40-character SHAs for base_sha and head_sha', () => {
      const valid = { ...SYNTHETIC_PR_IDENTITY };
      expect(PullRequestIdentitySchema.safeParse(valid).success).toBe(true);

      const shortBase = { ...SYNTHETIC_PR_IDENTITY, base_sha: 'abc123' };
      const shortResult = PullRequestIdentitySchema.safeParse(shortBase);
      expect(shortResult.success).toBe(false);

      const longHead = { ...SYNTHETIC_PR_IDENTITY, head_sha: 'a'.repeat(41) };
      const longResult = PullRequestIdentitySchema.safeParse(longHead);
      expect(longResult.success).toBe(false);
    });

    it('enforces provider to be "github"', () => {
      const gitlabPr = { ...SYNTHETIC_PR_IDENTITY, provider: 'gitlab' };
      const result = PullRequestIdentitySchema.safeParse(gitlabPr);
      expect(result.success).toBe(false);
    });

    it('fails when mandatory fields are missing', () => {
      const missingRepo = { ...SYNTHETIC_PR_IDENTITY };
      delete (missingRepo as any).repo;
      expect(PullRequestIdentitySchema.safeParse(missingRepo).success).toBe(false);

      const missingNumber = { ...SYNTHETIC_PR_IDENTITY };
      delete (missingNumber as any).number;
      expect(PullRequestIdentitySchema.safeParse(missingNumber).success).toBe(false);
    });
  });

  describe('ReviewFindingSchema', () => {
    it.each([
      { line: null, side: null },
      { line: null, side: 'RIGHT' },
      { line: 17, side: null },
      { line: 0, side: 'RIGHT' },
      { line: -1, side: 'LEFT' },
      { line: 1.5, side: 'RIGHT' },
      { line: Number.MAX_SAFE_INTEGER + 1, side: 'RIGHT' },
    ])('rejects verified findings without a usable anchor: %j', anchor => {
      const finding = { ...SYNTHETIC_FINDINGS[0], ...anchor };
      expect(ReviewFindingSchema.safeParse(finding).success).toBe(false);
      expect(ReviewReportSchema.safeParse({ ...SYNTHETIC_REPORT, findings: [finding] }).success).toBe(false);
    });

    it.each(['LEFT', 'RIGHT'])('accepts a verified positive integer anchor on %s', side => {
      expect(ReviewFindingSchema.safeParse({ ...SYNTHETIC_FINDINGS[0], line: 1, side }).success).toBe(true);
    });

    it.each(['needs_context', 'rejected'])('preserves nullable anchors for %s diagnostics', verification => {
      expect(ReviewFindingSchema.safeParse({ ...SYNTHETIC_FINDINGS[0], line: null, side: null, verification }).success).toBe(true);
    });

    it('validates all synthetic findings in fixtures', () => {
      for (const finding of SYNTHETIC_FINDINGS) {
        const result = ReviewFindingSchema.safeParse(finding);
        expect(result.success).toBe(true);
      }
    });

    it('validates severity enum and rejects invalid severities', () => {
      for (const sev of ['P0', 'P1', 'P2', 'P3']) {
        expect(SeveritySchema.safeParse(sev).success).toBe(true);
      }
      for (const invalid of ['P4', 'CRITICAL', 'INFO', 'HIGH', '']) {
        expect(SeveritySchema.safeParse(invalid).success).toBe(false);
      }
    });

    it('validates category enum and rejects invalid categories', () => {
      const validCategories = [
        'security',
        'correctness',
        'architecture',
        'testing',
        'performance',
        'reliability',
        'compatibility',
      ];
      for (const cat of validCategories) {
        expect(CategorySchema.safeParse(cat).success).toBe(true);
      }
      for (const invalid of ['styling', 'misc', 'documentation', 'unknown']) {
        expect(CategorySchema.safeParse(invalid).success).toBe(false);
      }
    });

    it('validates verification statuses: verified_diff, needs_context, rejected', () => {
      const base = SYNTHETIC_FINDINGS[0];

      expect(ReviewFindingSchema.safeParse({ ...base, verification: 'verified_diff' }).success).toBe(true);
      expect(ReviewFindingSchema.safeParse({ ...base, verification: 'needs_context' }).success).toBe(true);
      expect(ReviewFindingSchema.safeParse({ ...base, verification: 'rejected', rejection_reason: 'Outside diff' }).success).toBe(true);

      expect(ReviewFindingSchema.safeParse({ ...base, verification: 'approved' }).success).toBe(false);
      expect(ReviewFindingSchema.safeParse({ ...base, verification: 'unknown' }).success).toBe(false);
    });

    it('handles uncertain findings with nullable line, nullable side, and needs_context verification', () => {
      const uncertainFinding = {
        ...SYNTHETIC_FINDINGS[0],
        id: 'f-uncertain',
        line: null,
        side: null,
        verification: 'needs_context',
        evidence: 'Global module configuration may impact external microservices',
      };
      const result = ReviewFindingSchema.safeParse(uncertainFinding);
      expect(result.success).toBe(true);
    });

    it('rejects malformed findings with invalid types or missing mandatory fields', () => {
      const missingEvidence = { ...SYNTHETIC_FINDINGS[0] };
      delete (missingEvidence as any).evidence;
      expect(ReviewFindingSchema.safeParse(missingEvidence).success).toBe(false);

      const invalidLineType = { ...SYNTHETIC_FINDINGS[0], line: '42' };
      expect(ReviewFindingSchema.safeParse(invalidLineType).success).toBe(false);

      const invalidConfidence = { ...SYNTHETIC_FINDINGS[0], confidence: 'absolute' };
      expect(ReviewFindingSchema.safeParse(invalidConfidence).success).toBe(false);
    });
  });

  describe('Specialist Roles and Worker States', () => {
    it('validates four canonical specialists: security, logic, architecture, quality', () => {
      for (const role of ['security', 'logic', 'architecture', 'quality']) {
        expect(WorkerRoleSchema.safeParse(role).success).toBe(true);
      }
      expect(WorkerRoleSchema.safeParse('database').success).toBe(false);
      expect(WorkerRoleSchema.safeParse('jules').success).toBe(false);
      expect(WorkerRoleSchema.safeParse('pr-agent').success).toBe(false);
    });

    it('validates all 8 canonical worker states', () => {
      const states = [
        'queued',
        'running',
        'complete',
        'partial',
        'failed',
        'skipped',
        'timed_out',
        'cancelled',
      ];
      for (const state of states) {
        expect(WorkerStateSchema.safeParse(state).success).toBe(true);
      }
      expect(WorkerStateSchema.safeParse('idle').success).toBe(false);
      expect(WorkerStateSchema.safeParse('terminated').success).toBe(false);
    });
  });

  describe('ReviewReportSchema & Invariants', () => {
    it('validates canonical synthetic report fixture', () => {
      const result = ReviewReportSchema.safeParse(SYNTHETIC_REPORT);
      expect(result.success).toBe(true);
    });

    it('enforces schema_version "1.0.0"', () => {
      const badVersion = { ...SYNTHETIC_REPORT, schema_version: '2.0.0' };
      expect(ReviewReportSchema.safeParse(badVersion).success).toBe(false);
    });

    it('verifies tests.executed=false when specialist workers have not actually executed tests', () => {
      expect(SYNTHETIC_REPORT.tests.executed).toBe(false);
      expect(SYNTHETIC_REPORT.warnings).toContain(
        'Tests were not executed directly by specialist workers (tests.executed=false)'
      );
    });

    it('ensures a partially failed run cannot export an unflagged fully successful report', () => {
      // Create a report from a run where quality specialist failed
      const partialReport = {
        ...SYNTHETIC_REPORT,
        status: 'partial' as const,
        worker_states: [
          { worker_id: 'worker-sec', state: 'complete' as const },
          { worker_id: 'worker-log', state: 'complete' as const },
          { worker_id: 'worker-arc', state: 'complete' as const },
          { worker_id: 'worker-qty', state: 'failed' as const },
        ],
        warnings: [
          ...SYNTHETIC_REPORT.warnings,
          'Incomplete worker coverage: 1 specialist lane(s) failed (Quality, Testing & Performance Specialist)',
        ],
        summary: 'PARTIAL REVIEW: Incomplete specialist coverage (Quality failed).',
      };

      const result = ReviewReportSchema.safeParse(partialReport);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('partial');
        const failedWorker = result.data.worker_states.find(w => w.worker_id === 'worker-qty');
        expect(failedWorker?.state).toBe('failed');
        expect(result.data.warnings.some(w => w.includes('Incomplete worker coverage'))).toBe(true);
        expect(result.data.summary).toContain('PARTIAL REVIEW');
      }
    });

    it('rejects malformed report missing cryptographic report_digest or policy_revision', () => {
      const missingDigest = { ...SYNTHETIC_REPORT };
      delete (missingDigest as any).report_digest;
      expect(ReviewReportSchema.safeParse(missingDigest).success).toBe(false);

      const missingPolicy = { ...SYNTHETIC_REPORT };
      delete (missingPolicy as any).policy_revision;
      expect(ReviewReportSchema.safeParse(missingPolicy).success).toBe(false);
    });

    it('strictly enforces FinalWorkerState in final reports, rejecting queued, running, timed_out, and cancelled', () => {
      const unfinishedStates = ['queued', 'running', 'timed_out', 'cancelled'];
      for (const invalidState of unfinishedStates) {
        const invalidReport = {
          ...SYNTHETIC_REPORT,
          worker_states: [
            { worker_id: 'worker-sec', state: invalidState as any },
          ],
        };
        const result = ReviewReportSchema.safeParse(invalidReport);
        expect(result.success).toBe(false);
      }

      const validFinalStates = ['complete', 'partial', 'failed', 'skipped'];
      for (const validState of validFinalStates) {
        expect(FinalWorkerStateSchema.safeParse(validState).success).toBe(true);
        const validReport = {
          ...SYNTHETIC_REPORT,
          worker_states: [
            { worker_id: 'worker-sec', state: validState as any },
          ],
        };
        const result = ReviewReportSchema.safeParse(validReport);
        expect(result.success).toBe(true);
      }
    });
  });
});


describe('L2 — Authentic digest shape', () => {
  it.each(['sample-not-a-real-digest', 'sha256-custom-org-repo-1-full', 'sha256-1234', ''])('rejects placeholder digest %s', report_digest => {
    expect(ReviewReportSchema.safeParse({ ...SYNTHETIC_REPORT, report_digest }).success).toBe(false);
  });
});
