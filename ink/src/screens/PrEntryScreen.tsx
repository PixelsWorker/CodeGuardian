import React from 'react';
import { Box, Text } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';

interface PrEntryScreenProps {
  prUrl: string;
  error: string | null;
  onEditUrl: (edit: { text?: string; backspace?: boolean; preset?: string }) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const DEMO_PRESETS: Record<string, string> = {
  '1': 'https://github.com/example/demo/pull/42',
  '2': 'https://github.com/private-org/secret-repo/pull/1',
  '3': 'https://github.com/example/demo/pull/404',
  '4': 'https://github.com/example/demo/pull/99',
  '5': 'https://github.com/example/demo/pull/429',
};

const DEMO_PRESET_SYMBOLS: Record<string, string> = {
  '!': 'https://github.com/example/demo/pull/42',
  '@': 'https://github.com/private-org/secret-repo/pull/1',
  '#': 'https://github.com/example/demo/pull/404',
  '$': 'https://github.com/example/demo/pull/99',
  '%': 'https://github.com/example/demo/pull/429',
};

export function PrEntryScreen({ prUrl, error, onEditUrl, onSubmit, onBack }: PrEntryScreenProps) {
  useSafeInput((input, key) => {
    if (key.return) {
      onSubmit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }

    // Reducer decides whether a preset may replace the current text.
    if (key.ctrl && Object.hasOwn(DEMO_PRESETS, input)) {
      onEditUrl({ preset: DEMO_PRESETS[input], text: input });
      return;
    }

    // [!]..[%] triggers preset when empty or when currently displaying a known preset
    if (Object.hasOwn(DEMO_PRESET_SYMBOLS, input)) {
      onEditUrl({ preset: DEMO_PRESET_SYMBOLS[input], text: input });
      return;
    }

    if (key.backspace || key.delete) {
      onEditUrl({ backspace: true });
    } else if (input && !key.ctrl && !key.meta) {
      onEditUrl({ text: input });
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="white">Enter Target GitHub Pull Request URL:</Text>
      </Box>

      <Box borderStyle="round" borderColor={error ? "red" : "cyan"} padding={1} marginBottom={1}>
        <Text color="gray">URL: </Text>
        <Text bold color="white">{prUrl}</Text>
      </Box>

      {error ? (
        <Box borderStyle="single" borderColor="red" padding={1} marginBottom={1}>
          <Text bold color="red">Validation Error: </Text>
          <Text color="white">{error}</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="gray">Expected format: https://github.com/:owner/:repo/pull/:number</Text>
        </Box>
      )}

      <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1} marginBottom={1}>
        <Text bold color="cyan">Demo Scenario Presets (Press [!]..[%] or [Ctrl+1..5] to load):</Text>
        <Text color="white">• [!] / [Ctrl+1] Normal PR: <Text color="gray">https://github.com/example/demo/pull/42</Text></Text>
        <Text color="white">• [@] / [Ctrl+2] Unauthorized (403): <Text color="gray">https://github.com/private-org/secret-repo/pull/1</Text></Text>
        <Text color="white">• [#] / [Ctrl+3] Closed/Deleted (404): <Text color="gray">https://github.com/example/demo/pull/404</Text></Text>
        <Text color="white">• [$] / [Ctrl+4] Draft PR (Blocked): <Text color="gray">https://github.com/example/demo/pull/99</Text></Text>
        <Text color="white">• [%] / [Ctrl+5] Rate Limit (429): <Text color="gray">https://github.com/example/demo/pull/429</Text></Text>
      </Box>

      <Box>
        <Text color="green" bold>Press [Enter] to Inspect PR Diff</Text>
        <Text color="gray">  |  </Text>
        <Text color="white">Press [Esc] to Return</Text>
      </Box>
    </Box>
  );
}
