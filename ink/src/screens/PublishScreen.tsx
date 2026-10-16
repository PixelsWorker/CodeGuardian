import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ReviewReport } from '../types/contracts.js';

interface PublishScreenProps {
  report: ReviewReport;
  outcome: "normal" | "denied" | "stale_sha";
  onConfirmPublish: () => void;
  onDenyPublish: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export function PublishScreen({
  report,
  outcome,
  onConfirmPublish,
  onDenyPublish,
  onBack,
  onRestart,
}: PublishScreenProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [denied, setDenied] = useState(outcome === "denied");

  useInput((input, key) => {
    if (outcome === "stale_sha") {
      if (input === 'r' || input === 'R') {
        onRestart();
      } else if (key.escape) {
        onBack();
      }
      return;
    }

    if (input === 'r' || input === 'R') {
      setConfirmed(false);
      setDenied(false);
      onRestart();
      return;
    }

    if (key.escape) {
      onBack();
      return;
    }

    // Ignore further authorization/denial inputs once a decision is already made
    if (confirmed || denied) {
      return;
    }

    if (input === 'y' || input === 'Y') {
      setConfirmed(true);
      setDenied(false);
      onConfirmPublish();
    } else if (input === 'n' || input === 'N') {
      setDenied(true);
      setConfirmed(false);
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
        <Text color="gray">• Cryptographic Report Digest: <Text color="cyan">{report.report_digest.substring(0, 32)}...</Text></Text>
        <Text color="gray">• Review Action: <Text bold color="white">COMMENT</Text> (Never APPROVE or REQUEST_CHANGES)</Text>
        <Text color="gray">• Inline Comments: <Text color="white">{report.findings.length} findings placed on diff hunks</Text></Text>
      </Box>

      {outcome === "stale_sha" ? (
        <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="red">✗ PUBLICATION BLOCKED: STALE HEAD SHA</Text>
          <Text color="white">Remote PR head SHA has changed since analysis started. Publication refused to prevent posting stale comments.</Text>
        </Box>
      ) : confirmed ? (
        <Box borderStyle="double" borderColor="green" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="green">✓ SIMULATED PUBLICATION CONFIRMED</Text>
          <Text color="white">Dry-run receipt logged. Verification nonce validated. NO EXTERNAL WRITE PERFORMED.</Text>
        </Box>
      ) : denied ? (
        <Box borderStyle="double" borderColor="red" padding={1} flexDirection="column" marginBottom={1}>
          <Text bold color="red">✗ PUBLICATION DENIED BY OPERATOR</Text>
          <Text color="white">Review submission aborted. Report remains safely exported to local run artifact.</Text>
        </Box>
      ) : (
        <Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
          <Text bold color="white">Do you authorize submitting this review comment? (Simulated) [y/n]: </Text>
        </Box>
      )}

      <Box>
        {outcome === "stale_sha" ? (
          <Text color="white">Press <Text bold color="cyan">[R]</Text> to Restart Demo | <Text color="gray">[Esc] Back</Text></Text>
        ) : (
          <Text color="white">Press <Text bold color="green">[Y]</Text> to Authorize | <Text bold color="red">[N]</Text> to Deny | <Text bold color="cyan">[R]</Text> to Restart Demo | <Text color="gray">[Esc] Back</Text></Text>
        )}
      </Box>
    </Box>
  );
}
