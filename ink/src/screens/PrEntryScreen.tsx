import React from 'react';
import { Box, Text, useInput } from 'ink';

interface PrEntryScreenProps {
  prUrl: string;
  error: string | null;
  onChangeUrl: (url: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function PrEntryScreen({ prUrl, error, onChangeUrl, onSubmit, onBack }: PrEntryScreenProps) {
  useInput((input, key) => {
    if (key.return) {
      onSubmit();
    } else if (key.escape) {
      onBack();
    } else if (key.backspace || key.delete) {
      onChangeUrl(prUrl.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      onChangeUrl(prUrl + input);
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
          <Text color="gray">Example demo URL: https://github.com/example/demo/pull/42</Text>
        </Box>
      )}

      <Box>
        <Text color="green" bold>Press [Enter] to Inspect PR Diff</Text>
        <Text color="gray">  |  </Text>
        <Text color="white">Press [Esc] to Return</Text>
      </Box>
    </Box>
  );
}
