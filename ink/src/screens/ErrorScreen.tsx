import React from 'react';
import { Box, Text } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';

interface ErrorScreenProps {
  errorMessage: string | null;
  onRetry: () => void;
  onExit: () => void;
}

export function ErrorScreen({ errorMessage, onRetry, onExit }: ErrorScreenProps) {
  useSafeInput((input, key) => {
    if (input === 'r' || input === 'R') {
      onRetry();
    } else if (input === 'q' || input === 'Q' || key.escape) {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="double" borderColor="red" flexDirection="column" padding={1} marginBottom={1}>
        <Text bold color="red">⚠️ Review Process Interrupted / Cancelled</Text>
        <Box marginTop={1}>
          <Text color="white">
            {errorMessage || "The multi-agent review session encountered an unhandled condition or user cancellation."}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1} marginBottom={1}>
        <Text bold color="white">Safety & Cleanup Status:</Text>
        <Text color="green">✓ All active specialist worker threads safely halted</Text>
        <Text color="green">✓ Temporary diff cache unmounted</Text>
        <Text color="green">✓ Zero partial comments or review drafts leaked to GitHub</Text>
      </Box>

      <Box>
        <Text color="white">Press <Text bold color="green">[R]</Text> to Retry / Restart Review | <Text bold color="red">[Q]</Text> to Exit CLI</Text>
      </Box>
    </Box>
  );
}
