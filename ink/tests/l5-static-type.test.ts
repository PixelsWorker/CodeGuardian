import { describe, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import {
  PullRequestIdentitySchema,
  PullRequestIdentity,
  ReviewFindingSchema,
  ReviewFinding,
  ReviewReportSchema,
  ReviewReport,
  SeveritySchema,
  Severity,
  CategorySchema,
  Category,
  WorkerRoleSchema,
  WorkerRole,
  WorkerStateSchema,
  WorkerState,
  WorkerInfo,
  RunStatusSchema,
  RunStatus,
  ActiveScreen,
  AuthState,
} from '../src/types/contracts.js';
import { CliState, CliAction, createInitialState, cliReducer } from '../src/core/state-machine.js';

describe('L5 — Static Type and Contract Testing', () => {
  describe('Zod Schema Type Inferences & Contract Equivalence', () => {
    it('verifies PullRequestIdentity matches z.infer<typeof PullRequestIdentitySchema>', () => {
      expectTypeOf<PullRequestIdentity>().toEqualTypeOf<z.infer<typeof PullRequestIdentitySchema>>();
      expectTypeOf<PullRequestIdentity['provider']>().toEqualTypeOf<'github'>();
      expectTypeOf<PullRequestIdentity['owner']>().toBeString();
      expectTypeOf<PullRequestIdentity['repo']>().toBeString();
      expectTypeOf<PullRequestIdentity['number']>().toBeNumber();
      expectTypeOf<PullRequestIdentity['base_sha']>().toBeString();
      expectTypeOf<PullRequestIdentity['head_sha']>().toBeString();

      // Negative type assertion: provider cannot be a broad string or other host
      expectTypeOf<PullRequestIdentity['provider']>().not.toEqualTypeOf<string>();
      expectTypeOf<PullRequestIdentity['provider']>().not.toEqualTypeOf<'gitlab'>();
    });

    it('verifies ReviewFinding matches z.infer<typeof ReviewFindingSchema>', () => {
      expectTypeOf<ReviewFinding>().toEqualTypeOf<z.infer<typeof ReviewFindingSchema>>();
      expectTypeOf<ReviewFinding['severity']>().toEqualTypeOf<Severity>();
      expectTypeOf<ReviewFinding['category']>().toEqualTypeOf<Category>();
      expectTypeOf<ReviewFinding['line']>().toEqualTypeOf<number | null>();
      expectTypeOf<ReviewFinding['side']>().toEqualTypeOf<'RIGHT' | 'LEFT' | null>();
      expectTypeOf<ReviewFinding['confidence']>().toEqualTypeOf<'high' | 'medium' | 'low'>();
      expectTypeOf<ReviewFinding['verification']>().toEqualTypeOf<'verified_diff' | 'needs_context' | 'rejected'>();

      // Negative type assertion: severity cannot accept P4 or arbitrary string
      expectTypeOf<ReviewFinding['severity']>().not.toEqualTypeOf<'P4'>();
      expectTypeOf<ReviewFinding['verification']>().not.toEqualTypeOf<'approved'>();
    });

    it('verifies ReviewReport matches z.infer<typeof ReviewReportSchema>', () => {
      expectTypeOf<ReviewReport>().toEqualTypeOf<z.infer<typeof ReviewReportSchema>>();
      expectTypeOf<ReviewReport['schema_version']>().toEqualTypeOf<'1.0.0'>();
      expectTypeOf<ReviewReport['status']>().toEqualTypeOf<'ready' | 'partial' | 'blocked' | 'failed'>();
      expectTypeOf<ReviewReport['tests']['executed']>().toBeBoolean();
      expectTypeOf<ReviewReport['findings']>().toEqualTypeOf<ReviewFinding[]>();
      expectTypeOf<ReviewReport['pr']>().toEqualTypeOf<PullRequestIdentity>();

      // Negative type assertion: schema_version cannot be arbitrary string
      expectTypeOf<ReviewReport['schema_version']>().not.toEqualTypeOf<string>();
    });

    it('verifies WorkerRole matches four canonical specialist roles', () => {
      expectTypeOf<WorkerRole>().toEqualTypeOf<z.infer<typeof WorkerRoleSchema>>();
      expectTypeOf<WorkerRole>().toEqualTypeOf<'security' | 'logic' | 'architecture' | 'quality'>();

      // Negative type assertion
      expectTypeOf<WorkerRole>().not.toEqualTypeOf<'database'>();
      expectTypeOf<WorkerRole>().not.toEqualTypeOf<'jules'>();
    });

    it('verifies WorkerState matches 8 canonical lifecycle states', () => {
      expectTypeOf<WorkerState>().toEqualTypeOf<z.infer<typeof WorkerStateSchema>>();
      expectTypeOf<WorkerState>().toEqualTypeOf<
        'queued' | 'running' | 'complete' | 'partial' | 'failed' | 'skipped' | 'timed_out' | 'cancelled'
      >();

      // Negative type assertion
      expectTypeOf<WorkerState>().not.toEqualTypeOf<'idle'>();
    });

    it('verifies WorkerInfo interface contracts', () => {
      expectTypeOf<WorkerInfo['role']>().toEqualTypeOf<WorkerRole>();
      expectTypeOf<WorkerInfo['state']>().toEqualTypeOf<WorkerState>();
      expectTypeOf<WorkerInfo['progress']>().toBeNumber();
      expectTypeOf<WorkerInfo['findingsCount']>().toBeNumber();
      expectTypeOf<WorkerInfo['logs']>().toBeArray();
    });
  });

  describe('Reducer Actions & State Transitions Type Contracts', () => {
    it('verifies cliReducer returns CliState and handles CliAction', () => {
      expectTypeOf<ReturnType<typeof cliReducer>>().toEqualTypeOf<CliState>();
      expectTypeOf<ReturnType<typeof createInitialState>>().toEqualTypeOf<CliState>();
    });

    it('verifies ActiveScreen union type covers all 9 screens', () => {
      expectTypeOf<ActiveScreen>().toEqualTypeOf<
        | 'welcome'
        | 'auth'
        | 'pr_input'
        | 'inspection'
        | 'specialist'
        | 'consensus'
        | 'report'
        | 'publish'
        | 'error'
      >();
    });

    it('verifies AuthState union type covers 4 reachable authentication states', () => {
      expectTypeOf<AuthState>().toEqualTypeOf<
        'authenticated' | 'not_authenticated' | 'insufficient_permissions' | 'session_expired'
      >();
    });

    it('verifies RunStatus covers all canonical status states', () => {
      expectTypeOf<RunStatus>().toEqualTypeOf<z.infer<typeof RunStatusSchema>>();
      expectTypeOf<RunStatus>().toEqualTypeOf<
        | 'queued'
        | 'inspecting'
        | 'running'
        | 'validating'
        | 'ready'
        | 'partial'
        | 'blocked'
        | 'failed'
        | 'cancelled'
        | 'awaiting_approval'
        | 'publishing'
        | 'published'
      >();
    });
  });
});
