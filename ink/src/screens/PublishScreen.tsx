import React from 'react';
import { Box, Text } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { ReviewReport } from '../types/contracts.js';
import { PublishOutcome } from '../core/state-machine.js';

interface PublishScreenProps {
  report: ReviewReport;
  outcome: PublishOutcome;
  decision?: "pending" | "confirmed" | "denied";
  onConfirmPublish: () => void;
  onDenyPublish: () => void;
  onToggleStaleSha?: () => void;
  onTogglePermissionDenied?: () => void;
  onToggleDuplicate?: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export function PublishScreen({
  report,
  outcome,
  decision = "pending",
  onConfirmPublish,
  onDenyPublish,
  onToggleStaleSha,
  onTogglePermissionDenied,
  onToggleDuplicate,
  onBack,
  onRestart,
}: PublishScreenProps) {
  const confirmed = decision === "confirmed";
  const denied = decision === "denied" || outcome === "denied";
  const isStale = outcome === "stale_sha";
  const isPermissionDenied = outcome === "permission_denied";
  const isDuplicate = outcome === "duplicate";

  const verifiedInline = report.findings.filter(f => f.verification === "verified_diff");
  const uncertainSummary = report.findings.filter(f => f.verification === "needs_context");

  useSafeInput((input, key) => {
    if (input === 'r' || input === 'R') {
      onRestart();
      return;
    }

    if (key.escape) {
      onBack();
      return;
    }

    if (input === 's' || input === 'S') {
      if (!confirmed && !denied) {
        onToggleStaleSha?.();
      }
      return;
    }

    if (input === 'p' || input === 'P') {
      if (!confirmed && !denied) {
        onTogglePermissionDenied?.();
      }
      return;
    }

    if (input === 'd' || input === 'D') {
      if (!confirmed && !denied) {
        onToggleDuplicate?.();
      }
      return;
    }

    if (isStale || isPermissionDenied) {
      return;
    }

    // Ignore further authorization/denial inputs once a decision is already made in the reducer
    if (confirmed || denied) {
      return;
    }

    if (input === 'y' || input === 'Y') {
      onConfirmPublish();
    } else if (input === 'n' || input === 'N') {
      onDenyPublish();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="single" borderColor="yellow" flexDirection="column" padding={1} marginBottom={1}>
        <Text bold color="yellow">⚠️  Dry-Run Publication Preview & Safeguards</Text>
        <Text color="white">A GitHub COMMENT review is prepared, but will NOT be submitted without confirmation.</Text>
        <Text color="cyan">Simulation Note: Under G00, NO EXTERNAL API CALL OR NETWORK WRITE OCCURS.</Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
        <Text bold color="white">Publication Payload Verification:</Text>
        <Text color="gray">• Target PR: <Text color="white">#{report.pr.number} ({report.pr.owner}/{report.pr.repo})</Text></Text>
        <Text color="gray">• Target Head SHA: <Text color="white">{report.pr.head_sha}</Text></Text>
        <Text color="gray">• Cryptographic Report Digest: <Text color="cyan">{report.report_digest}</Text></Text>
        <Text color="gray">• Review Action: <Text bold color="white">COMMENT</Text> (Never APPROVE or REQUEST_CHANGES)</Text>
        <Text color="gray">• Inline Comments: <Text color="white">{verifiedInline.length} findings placed on verified diff hunks</Text></Text>
        {uncertainSummary.length > 0 && (
          <Text color="yellow">• Summary-only Findings: <Text color="yellow">{uncertainSummary.length} unverified findings (needs context, omitted from inline)</Text></Text>
        )}
      </Box>

      <Box flexDirection="column">
        <Text>Run: {report.run_id} | Review status: {report.status}</Text>
        <Text>{report.summary}</Text>
        {report.worker_states.map(w => <Text key={w.worker_id}>{w.worker_id}: {w.state}</Text>)}
        {report.warnings.map((w, i) => <Text key={i} color="yellow">{w}</Text>)}
      </Box>

      {isDuplicate && !confirmed && !denied && (
        <Box borderStyle="single" borderColor="yellow" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="yellow">⚠️  WARNING: DUPLICATE PUBLICATION DETECTED</Text>
          <Text color="white">A CodeGuardian review comment was already published for commit SHA {report.pr.head_sha}. Submitting again will log an idempotent skip.</Text>
        </Box>
      )}

      {isStale ? (
        <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="red">✗ PUBLICATION BLOCKED: STALE HEAD SHA</Text>
          <Text color="white">Remote PR head SHA has changed since analysis started. Publication refused to prevent posting stale comments.</Text>
        </Box>
      ) : isPermissionDenied ? (
        <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="red">✗ PUBLICATION BLOCKED: PERMISSION DENIED (HTTP 403)</Text>
          <Text color="white">GitHub token lacks write access or 'pull_requests: write' scope. Review comment submission aborted.</Text>
        </Box>
      ) : confirmed ? (
        <Box borderStyle="double" borderColor="green" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="green">✓ SIMULATED PUBLICATION CONFIRMED</Text>
          <Text color="white">Dry-run receipt logged. Verification nonce validated. NO EXTERNAL WRITE PERFORMED.</Text>
          {isDuplicate && (
            <Text color="yellow">Notice: Review already posted for this commit SHA. Idempotent skip logged.</Text>
          )}
        </Box>
      ) : denied ? (
        <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="red">✗ PUBLICATION DENIED BY OPERATOR</Text>
          <Text color="white">Review submission aborted. Report remains available in the current session.</Text>
        </Box>
      ) : (
        <Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
          <Text bold color="white">Do you authorize submitting this review comment? (Simulated) [y/n]: </Text>
        </Box>
      )}

      <Box>
        {confirmed || denied ? (
          <Text color="white">Decision locked. Press <Text bold color="cyan">[R]</Text> to Restart Demo | <Text color="gray">[Esc] Back</Text></Text>
        ) : isStale ? (
          <Text color="white">Press <Text bold color="yellow">[S]</Text> to Toggle Stale SHA (Demo) | <Text bold color="cyan">[R]</Text> to Restart Demo | <Text color="gray">[Esc] Back</Text></Text>
        ) : isPermissionDenied ? (
          <Text color="white">Press <Text bold color="yellow">[P]</Text> to Toggle Permission Denied (Demo) | <Text bold color="cyan">[R]</Text> to Restart Demo | <Text color="gray">[Esc] Back</Text></Text>
        ) : (
          <Text color="white">Press <Text bold color="green">[Y]</Text> to Authorize | <Text bold color="red">[N]</Text> to Deny | <Text bold color="yellow">[S]</Text> Stale SHA | <Text bold color="yellow">[P]</Text> Permission Denied | <Text bold color="yellow">[D]</Text> Duplicate | <Text color="gray">[Esc] Back</Text></Text>
        )}
      </Box>
    </Box>
  );
}
