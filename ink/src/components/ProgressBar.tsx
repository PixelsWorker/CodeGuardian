import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  progress: number; // 0 to 100
  width?: number;
  color?: string;
}

export function ProgressBar({ progress, width = 30, color = "cyan" }: ProgressBarProps) {
  const bounded = Math.max(0, Math.min(100, progress));
  const filledCount = Math.round((bounded / 100) * width);
  const emptyCount = width - filledCount;

  const filled = "█".repeat(filledCount);
  const empty = "░".repeat(emptyCount);

  return (
    <Box>
      <Text color={color}>{filled}</Text>
      <Text color="gray">{empty}</Text>
      <Text color="white"> {bounded}%</Text>
    </Box>
  );
}
