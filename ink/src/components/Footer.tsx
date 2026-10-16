import React from 'react';
import { Box, Text } from 'ink';

interface FooterProps {
  hints?: string[];
}

export function Footer({ hints = ["[Enter] Continue", "[Esc] Back", "[Ctrl+C] Quit"] }: FooterProps) {
  return (
    <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Box>
        {hints.map((hint, idx) => (
          <Text key={idx} color="gray">
            {idx > 0 ? "  |  " : ""}
            <Text color="cyan">{hint.split(" ")[0]}</Text>
            {hint.substring(hint.indexOf(" "))}
          </Text>
        ))}
      </Box>
      <Box>
        <Text color="gray">TUI v0.1.0</Text>
      </Box>
    </Box>
  );
}
