import React from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';

interface WelcomeScreenProps {
  onStart: () => void;
  onAuthCheck: () => void;
}

export function WelcomeScreen({ onStart, onAuthCheck }: WelcomeScreenProps) {
  const { columns } = useWindowSize();
  const compact = columns < 65;

  useSafeInput((input, key) => {
    if (key.return) {
      onStart();
    } else if (input === 'a' || input === 'A') {
      onAuthCheck();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="double" borderColor="cyan" flexDirection="column" padding={1} marginBottom={1}>
        <Text bold color="cyan">Welcome to CodeGuardian Native Terminal Reviewer</Text>
        <Text color="gray">Bounded, deterministic multi-agent GitHub pull request review system.</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="white">Available Commands & Workflows:</Text>
        <Text color="white">  • <Text color="cyan">codeguardian review &lt;PR_URL&gt; --demo</Text> : Full interactive multi-agent review</Text>
        <Text color="white">  • <Text color="cyan">codeguardian auth status</Text>                : Preflight check for GitHub/Codex</Text>
        <Text color="white">  • <Text color="cyan">codeguardian report &lt;RUN_ID&gt; --format json</Text>  : Export review findings</Text>
        <Text color="white">  • <Text color="cyan">codeguardian publish &lt;RUN_ID&gt; --dry-run</Text>    : Dry-run publish review gate</Text>
      </Box>

      <Box borderStyle="single" borderColor="yellow" flexDirection="column" padding={1} marginBottom={1}>
        <Text bold color="yellow">G00 Synthetic Prototype Notes:</Text>
        <Text color="white">• All analyses use local AST diff fixtures. Zero network calls to GitHub or model APIs.</Text>
        <Text color="white">• Canonical 4 specialists: Security, Logic & Correctness, Architecture, Quality/Testing.</Text>
        <Text color="white">• Dry-run publishing preview performs ZERO external writes.</Text>
      </Box>

      <Box flexDirection={compact ? 'column' : 'row'}>
        <Text color="green" bold>Press [Enter] to Begin PR Review</Text>
        {compact ? (
          <Text color="gray">or</Text>
        ) : (
          <Text color="gray">  or  </Text>
        )}
        <Text color="cyan">Press [A] for Auth Status</Text>
      </Box>
    </Box>
  );
}
