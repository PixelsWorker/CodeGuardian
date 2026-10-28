import React, { useState } from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { PullRequestIdentity, PullRequestSnapshot } from '../types/contracts.js';
import { MOCK_DIFF_FILES } from '../fixtures/fixtures.js';
import { DiffHunkView } from '../components/DiffHunkView.js';

const MAX_VISIBLE_FILE_WINDOW = 20;
const MAX_VISIBLE_PATCH_LINES = 120;

function clipTerminalLine(value: string, width: number): string {
  const characters = Array.from(value);
  if (characters.length <= width) return value;
  return `${characters.slice(0, Math.max(0, width - 1)).join('')}…`;
}

interface InspectScreenProps {
  pr: PullRequestIdentity;
  snapshot?: PullRequestSnapshot;
  onStartAnalysis: () => void;
  onBack: () => void;
}

/** Renders either the G00 synthetic inspection or a supplied G01 live snapshot. */
export function InspectScreen({ pr, snapshot, onStartAnalysis, onBack }: InspectScreenProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { columns, rows } = useWindowSize();
  const files = snapshot?.files ?? MOCK_DIFF_FILES.map(file => ({
    path: file.path,
    previous_path: null,
    status: file.status as 'modified',
    additions: file.additions,
    deletions: file.deletions,
    patch: file.hunk,
    patch_available: true,
    patch_truncated: false,
  }));
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
      setSelectedIdx(prev => (prev < files.length - 1 ? prev + 1 : prev));
    } else if (key.upArrow || input === 'k') {
      setSelectedIdx(prev => (prev > 0 ? prev - 1 : prev));
    }
  });

  const selectedFile = files[selectedIdx];
  const fileWindowStart = 0;
  const visibleFiles = files;
  const patchText = selectedFile?.patch ?? 'GitHub did not provide a patch for this file.';
  const patchLines = patchText.split('\n');
  const patchPreview = patchLines.slice(0, MAX_VISIBLE_PATCH_LINES).join('\n');

  if (snapshot) {
    // Keep live identity and useful diff context within the available viewport.
    // Reserve the responsive application header, its margin, identity, status,
    // file/diff labels and footer before allocating the remaining terminal rows.
    const terminalRows = rows || 24;
    const shaRows = columns < 58 ? 4 : 2;
    const headerRows = columns < 80 ? 5 : 3;
    const reservedRows = headerRows + 1 + shaRows + 6 + 1;
    const contentRows = Math.max(2, terminalRows - reservedRows);
    const visibleFileCount = Math.min(MAX_VISIBLE_FILE_WINDOW, files.length, Math.max(1, Math.ceil(contentRows / 2)));
    const liveFileStart = Math.min(
      Math.max(selectedIdx - Math.floor(visibleFileCount / 2), 0),
      Math.max(files.length - visibleFileCount, 0),
    );
    const liveFiles = files.slice(liveFileStart, liveFileStart + visibleFileCount);
    const patchLineCount = Math.min(MAX_VISIBLE_PATCH_LINES, Math.max(1, contentRows - liveFiles.length));
    const livePatchLines = patchLines.slice(0, patchLineCount);
    const lineWidth = Math.max(12, columns - 2);
    const title = clipTerminalLine(`PR #${pr.number}: ${pr.title ?? ''}`, lineWidth);
    const details = clipTerminalLine(
      `${snapshot.state}${snapshot.is_draft ? ' · DRAFT' : ''} · ${pr.additions ?? 0}+ ${pr.deletions ?? 0}- · ${files.length} files · ${snapshot.retrieved_at}`,
      lineWidth,
    );
    const warning = snapshot.warnings.length
      ? `${snapshot.warnings[0]}${snapshot.warnings.length > 1 ? ` (+${snapshot.warnings.length - 1} more)` : ''}`
      : '';
    const status = clipTerminalLine(
      `${snapshot.status === 'complete' ? 'LIVE SNAPSHOT COMPLETE' : 'LIVE SNAPSHOT PARTIAL'} · read only · no workers or publication${warning ? ` · ${warning}` : ''}`,
      lineWidth,
    );
    const diffTitle = clipTerminalLine(
      selectedFile ? `Diff ${selectedFile.path} · ${livePatchLines.length}/${patchLines.length} lines` : 'Diff unavailable',
      lineWidth,
    );

    return (
      <Box flexDirection="column">
        <Text bold color="white">{title}</Text>
        <Text color="gray">Base SHA: <Text color="white">{pr.base_sha}</Text></Text>
        <Text color="gray">Head SHA: <Text color="white">{pr.head_sha}</Text></Text>
        <Text color="gray">{details}</Text>
        <Text color={snapshot.status === 'complete' ? 'green' : 'yellow'}>{status}</Text>
        <Text color="white" bold>{clipTerminalLine(
          `Files ${liveFiles.length ? liveFileStart + 1 : 0}–${liveFileStart + liveFiles.length} of ${files.length} · ↑/↓ or j/k to select`,
          lineWidth,
        )}</Text>
        {liveFiles.map((file, offset) => {
          const index = liveFileStart + offset;
          const selected = index === selectedIdx;
          const flags = [!file.patch_available ? 'patch unavailable' : '', file.patch_truncated ? 'patch truncated' : ''].filter(Boolean).join(' · ');
          const fileRow = clipTerminalLine(
            `${selected ? '▶' : ' '} ${file.path} [${file.status}] +${file.additions} -${file.deletions}${flags ? ` · ${flags}` : ''}`,
            lineWidth,
          );
          return <Text key={`${file.path}:${index}`} color={selected ? 'cyan' : 'gray'}>{fileRow}</Text>;
        })}
        <Text color="gray">{diffTitle}</Text>
        {livePatchLines.length
          ? livePatchLines.map((line, index) => {
              const color = line.startsWith('+') ? 'green' : line.startsWith('-') ? 'red' : line.startsWith('@') ? 'cyan' : 'white';
              return <Text key={index} color={color}>{clipTerminalLine(line, lineWidth)}</Text>;
            })
          : <Text color="gray">GitHub did not provide a patch for this file.</Text>}
        <Text color="gray">G01 read-only · [Esc] return · [Q] quit</Text>
      </Box>
    );
  }

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
          <Text color="gray">Base: <Text color="white">{pr.base_sha.substring(0, 7)}</Text>{pr.base_branch ? ` (${pr.base_branch})` : ''}</Text>
          <Text color="gray">Head: <Text color="white">{pr.head_sha.substring(0, 7)}</Text>{pr.head_branch ? ` (${pr.head_branch})` : ''}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Changes: </Text>
          <Text color="green">+{pr.additions ?? 0} </Text>
          <Text color="red">-{pr.deletions ?? 0} </Text>
          <Text color="gray">across {pr.changed_files_count ?? files.length} modified files</Text>
        </Box>
      </Box>

      {/* Synthetic risk content is shown only for the G00 demo fixture. */}
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
        {visibleFiles.map((file, offset) => {
          const idx = fileWindowStart + offset;
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
          hunk={patchPreview}
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
