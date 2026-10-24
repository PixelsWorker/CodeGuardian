import React from 'react';
import { Box, Text, useWindowSize } from 'ink';

interface FooterProps {
  hints?: string[];
}

export function Footer({ hints = ["[Enter] Continue", "[Esc] Back", "[Ctrl+C] Quit"] }: FooterProps) {
  const { columns } = useWindowSize();
  const compact = columns < 72;

  return (
    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1} flexDirection={compact ? 'column' : 'row'} justifyContent="space-between">
      <Box flexDirection={compact ? 'column' : 'row'}>
        {hints.map((hint, idx) => (
          <Text key={idx} color="gray">
            {idx > 0 && !compact ? "  |  " : ""}
            <Text color="cyan">{hint.split(" ")[0]}</Text>
            {hint.substring(hint.indexOf(" "))}
          </Text>
        ))}
      </Box>
      <Box alignItems={compact ? 'flex-start' : 'flex-end'}>
        <Text color="gray">TUI v0.1.0</Text>
      </Box>
    </Box>
  );
}
