import React from 'react';
import { Box, Text } from 'ink';

interface DiffHunkViewProps {
  path: string;
  additions: number;
  deletions: number;
  hunk: string;
}

export function DiffHunkView({ path, additions, deletions, hunk }: DiffHunkViewProps) {
  const lines = hunk.split('\n');

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1} marginY={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="white">{path}</Text>
        <Box>
          <Text color="green">+{additions} </Text>
          <Text color="red">-{deletions}</Text>
        </Box>
      </Box>
      {lines.map((line, idx) => {
        let color = "white";
        if (line.startsWith('+')) color = "green";
        else if (line.startsWith('-')) color = "red";
        else if (line.startsWith('@')) color = "cyan";

        return (
          <Text key={idx} color={color}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
}
