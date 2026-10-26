import React, { useState } from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { ReviewReport } from '../types/contracts.js';
import { formatReportMarkdown, formatReportJson } from '../core/report-formatter.js';

interface ReportScreenProps {
  report: ReviewReport;
  onProceedToPublish: () => void;
  onBack: () => void;
}

export function ReportScreen({ report, onProceedToPublish, onBack }: ReportScreenProps) {
  const { columns } = useWindowSize();
  const [format, setFormat] = useState<"summary" | "markdown" | "json">("summary");
  const [fullExport, setFullExport] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const reportHeading = `Consolidated Review Report (Run: ${report.run_id}):`;
  const formatLabel = `Format: [${format.toUpperCase()}]`;
  const enterAction = 'Press [Enter] to Open Dry-Run Publication Gate';
  const escapeAction = 'Press [Esc] to Return';
  const availableColumns = Math.max(columns - 2, 0);
  const reportHeadingWidth = /^[\x20-\x7E]*$/.test(reportHeading)
    ? reportHeading.length
    : Number.POSITIVE_INFINITY;
  const compactHeader = reportHeadingWidth + 1 + formatLabel.length > availableColumns;
  const compactActions = enterAction.length + '  |  '.length + escapeAction.length > availableColumns;

  useSafeInput((input, key) => {
    if (key.return) {
      onProceedToPublish();
    } else if (key.escape) {
      onBack();
    } else if (input === 'm' || input === 'M') {
      setFormat(prev => (prev === "markdown" ? "summary" : "markdown"));
    } else if (input === 'j' || input === 'J') {
      setFormat(prev => (prev === "json" ? "summary" : "json"));
    } else if (input === 'e' || input === 'E') {
      setFullExport(prev => !prev);
    } else if (key.downArrow) {
      setSelectedIdx(prev => (prev < report.findings.length - 1 ? prev + 1 : prev));
    } else if (key.upArrow) {
      setSelectedIdx(prev => (prev > 0 ? prev - 1 : prev));
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection={compactHeader ? 'column' : 'row'} justifyContent={compactHeader ? 'flex-start' : 'space-between'} marginBottom={1}>
        <Text bold color="white">{reportHeading}</Text>
        <Box>
          <Text color="gray">Format: </Text>
          <Text bold color="cyan">[{format.toUpperCase()}]</Text>
        </Box>
      </Box>

      {format === "summary" && (
        <Box flexDirection="column">
          <Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
            <Text color="white">{report.summary}</Text>
          </Box>

          <Box marginBottom={1}>
            <Text bold color="white">
              Findings ({report.findings.length} total — use [↑/↓] to inspect):
            </Text>
          </Box>

          <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
            {report.findings.map((f, idx) => {
              const isSelected = idx === selectedIdx;
              const sevColor = f.severity === 'P0' ? 'red' : f.severity === 'P1' ? 'yellow' : 'cyan';
              const verificationLabel = f.verification === 'verified_diff' ? 'VERIFIED DIFF'
                : f.verification === 'needs_context' ? 'NEEDS CONTEXT' : 'REJECTED';

              return (
                <Box key={f.id} flexDirection="column" marginY={0}>
                  <Box>
                    <Text color={isSelected ? "cyan" : "gray"}>{isSelected ? "▶ " : "  "}</Text>
                    <Text bold color={sevColor}>[{f.severity}] </Text>
                    <Text color={f.verification === 'verified_diff' ? 'green' : 'yellow'}>[{verificationLabel}] </Text>
                  </Box>
                  <Box paddingLeft={4}>
                    <Text bold={isSelected} color={isSelected ? "white" : "gray"}>{f.title}</Text>
                  </Box>
                  {isSelected && (
                    <Box flexDirection="column" paddingLeft={4} marginY={1}>
                      <Text color="gray">Path: <Text color="white">{f.path}:{f.line}</Text> | Specialists: {f.source_workers.join(', ')}</Text>
                      <Text color="gray">Evidence: <Text color="yellow">{f.evidence}</Text></Text>
                      <Text color="gray">Impact: <Text color="red">{f.impact}</Text></Text>
                      {f.verification === 'rejected' ? (
                        <Text color="yellow">Rejection reason: {f.rejection_reason || 'No rejection reason provided.'} Excluded from publication.</Text>
                      ) : (
                        <Text color="gray">Recommendation: <Text color="green">{f.recommendation}</Text></Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {format === "markdown" && (
        <Box borderStyle="single" borderColor="gray" padding={1} marginBottom={1} flexDirection="column">
          <Text color="cyan">{fullExport ? formatReportMarkdown(report) : `${formatReportMarkdown(report).substring(0, 800)}...`}</Text>
          <Box marginTop={1}>
            <Text color="gray">[E toggles full in-session export. CLI offline recipe: codeguardian report {report.run_id} --format markdown]</Text>
          </Box>
        </Box>
      )}

      {format === "json" && (
        <Box borderStyle="single" borderColor="gray" padding={1} marginBottom={1} flexDirection="column">
          <Text color="green">{fullExport ? formatReportJson(report) : `${formatReportJson(report).substring(0, 800)}...`}</Text>
          <Box marginTop={1}>
            <Text color="gray">[E toggles full in-session export. CLI offline recipe: codeguardian report {report.run_id} --format json]</Text>
          </Box>
        </Box>
      )}

      <Box flexDirection="column" marginBottom={1}>
        <Text>Status: {report.status} | Digest: {report.report_digest}</Text>
        {report.worker_states.map(w => <Text key={w.worker_id}>{w.worker_id}: {w.state}</Text>)}
        {report.warnings.map((w, i) => <Text key={i} color="yellow">{w}</Text>)}
        <Text color="gray">[E] Full current report (no file writes); CLI IDs reconstruct fixed offline recipes.</Text>
        <Text color="gray">Controls: Press <Text bold color="cyan">[M]</Text> for Markdown toggle | <Text bold color="cyan">[J]</Text> for JSON toggle</Text>
      </Box>

      <Box flexDirection={compactActions ? 'column' : 'row'}>
        <Text color="green" bold>{enterAction}</Text>
        {!compactActions && <Text color="gray">  |  </Text>}
        <Text color="white">{escapeAction}</Text>
      </Box>
    </Box>
  );
}
