import React, { useState } from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { PullRequestIdentity } from '../types/contracts.js';
import { MOCK_DIFF_FILES } from '../fixtures/fixtures.js';
import { DiffHunkView } from '../components/DiffHunkView.js';

interface InspectScreenProps {
  pr: PullRequestIdentity;
  onStartAnalysis: () => void;
  onBack: () => void;
}

/**
 * Renders the synthetic PR inspection view with a header that keeps the full
 * pull request title and author readable at the current terminal width.
 */
export function InspectScreen({ pr, onStartAnalysis, onBack }: InspectScreenProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { columns } = useWindowSize();
  const prTitle = `PR #${pr.number}: ${pr.title ?? ''}`;
  const authorLabel = `Author: @${pr.author ?? ''}`;
  const headerContentWidth = prTitle.length + authorLabel.length + 2;
  const compactHeader =
    !/^[\x20-\x7E]*$/.test(`${prTitle}${authorLabel}`) ||
    headerContentWidth > Math.max(columns - 6, 0);

  useSafeInput((input, key) => {
    if (key.return) {
      onStartAnalysis();
    } else if (key.escape) {
      onBack();
    } else if (key.downArrow || input === 'j') {
      setSelectedIdx(prev => (prev < MOCK_DIFF_FILES.length - 1 ? prev + 1 : prev));
    } else if (key.upArrow || input === 'k') {
      setSelectedIdx(prev => (prev > 0 ? prev - 1 : prev));
    }
  });

  const selectedFile = MOCK_DIFF_FILES[selectedIdx];

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="single" borderColor="cyan" flexDirection="column" paddingX={1} marginBottom={1}>
        <Box
          width="100%"
          flexDirection={compactHeader ? 'column' : 'row'}
          justifyContent={compactHeader ? undefined : 'space-between'}
          alignItems={compactHeader ? 'flex-start' : undefined}
        >
          <Text bold color="white">{prTitle}</Text>
          <Text color="gray">{compactHeader ? '' : '  '}{authorLabel}</Text>
        </Box>
        <Box justifyContent="space-between" marginTop={1}>
          <Text color="gray">Base: <Text color="white">{pr.base_sha.substring(0, 7)}</Text> ({pr.base_branch})</Text>
          <Text color="gray">Head: <Text color="white">{pr.head_sha.substring(0, 7)}</Text> ({pr.head_branch})</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Changes: </Text>
          <Text color="green">+{pr.additions} </Text>
          <Text color="red">-{pr.deletions} </Text>
          <Text color="gray">across {pr.changed_files_count} modified files</Text>
        </Box>
      </Box>

      {/* Pre-Review Surface Risk Overview */}
      <Box borderStyle="round" borderColor="yellow" flexDirection="column" paddingX={1} marginBottom={1}>
        <Box justifyContent="space-between">
          <Text bold color="yellow">⚠️  Pre-Review Surface Risk Classifier:</Text>
          <Text bold color="red">
            {pr.owner === "example" && pr.repo === "demo" && pr.number === 42
              ? "HIGH RISK (AUTH & CRYPTO)"
              : "HIGH RISK [SYNTHETIC DEMO FIXTURE]"}
          </Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text color="red">• RISK: SENSITIVE_AUTH_PATH (`src/auth/*` modified)</Text>
          <Text color="yellow">• RISK: NEW_EXTERNAL_DEP (`jsonwebtoken` added to package.json)</Text>
          <Text color="cyan">• SURFACE: IN_MEMORY_CACHE_STATE (`src/auth/session.ts` introduces unbounded map)</Text>
          {(pr.owner !== "example" || pr.repo !== "demo" || pr.number !== 42) && (
            <Text color="gray">  (Synthetic demo fixture heuristics applied for custom PR demonstration)</Text>
          )}
        </Box>
      </Box>

      <Box marginBottom={1}>
        <Text bold color="white">
          Changed Files List (Use [↑/↓] or [j/k] to preview diff hunks):
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {MOCK_DIFF_FILES.map((file, idx) => {
          const isSelected = idx === selectedIdx;
          return (
            <Box key={file.path}>
              <Text color={isSelected ? "cyan" : "gray"}>
                {isSelected ? " ▶ " : "   "}
                <Text bold={isSelected} color={isSelected ? "white" : "gray"}>
                  {file.path}
                </Text>
                {" "}
                <Text color="green">+{file.additions}</Text>{" "}
                <Text color="red">-{file.deletions}</Text>
              </Text>
            </Box>
          );
        })}
      </Box>

      {selectedFile && (
        <DiffHunkView
          path={selectedFile.path}
          additions={selectedFile.additions}
          deletions={selectedFile.deletions}
          hunk={selectedFile.hunk}
        />
      )}

      <Box marginTop={1}>
        <Text color="green" bold>Press [Enter] to Dispatch 4 Specialist Workers</Text>
        <Text color="gray">  |  </Text>
        <Text color="white">Press [Esc] to Return</Text>
      </Box>
    </Box>
  );
}
