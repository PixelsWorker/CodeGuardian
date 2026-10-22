import React from 'react';
import { Text, Box } from 'ink';

export function SmokeApp({ name }: { name: string }) {
  return (
    <Box borderStyle="round" borderColor="cyan" padding={1}>
      <Text color="green">CodeGuardian Ink 8 Smoke Test: {name}</Text>
    </Box>
  );
}
