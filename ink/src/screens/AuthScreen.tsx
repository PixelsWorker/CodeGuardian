import React from 'react';
import { Box, Text, useInput } from 'ink';
import { AuthState } from '../types/contracts.js';

interface AuthScreenProps {
  githubAuth: AuthState;
  codexAuth: AuthState;
  onContinue: () => void;
  onBack: () => void;
}

export function AuthScreen({ githubAuth, codexAuth, onContinue, onBack }: AuthScreenProps) {
  useInput((input, key) => {
    if (key.return) {
      onContinue();
    } else if (key.escape) {
      onBack();
    }
  });

  const getStatusBadge = (status: AuthState) => {
    switch (status) {
      case "authenticated":
        return <Text bold color="green">✓ AUTHENTICATED</Text>;
      case "insufficient_permissions":
        return <Text bold color="yellow">⚠️ INSUFFICIENT SCOPES</Text>;
      case "session_expired":
        return <Text bold color="red">✗ EXPIRED SESSION</Text>;
      case "not_authenticated":
      default:
        return <Text bold color="red">✗ NOT AUTHENTICATED</Text>;
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="white">Local Authentication & Toolchain Preflight Status:</Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
        <Box justifyContent="space-between" marginBottom={1}>
          <Box flexDirection="column">
            <Text bold color="white">GitHub CLI (gh) Session</Text>
            <Text color="gray">Required for read-only PR metadata, changed files, and diff inspection</Text>
          </Box>
          <Box>{getStatusBadge(githubAuth)}</Box>
        </Box>

        <Box justifyContent="space-between" marginTop={1}>
          <Box flexDirection="column">
            <Text bold color="white">Codex CLI / SDK Session</Text>
            <Text color="gray">Required for bounded specialist analysis lanes (ChatGPT login or API key)</Text>
          </Box>
          <Box>{getStatusBadge(codexAuth)}</Box>
        </Box>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">Authentication Remediation Instructions:</Text>
        <Text color="white">• If GitHub fails: Run <Text color="yellow">gh auth login -w -s repo:read</Text></Text>
        <Text color="white">• If Codex fails: Run <Text color="yellow">codex login --device-auth</Text></Text>
        <Text color="gray">Note: In G00 DEMO mode, simulated credentials allow walkthrough testing.</Text>
      </Box>

      <Box>
        <Text color="green" bold>Press [Enter] to Proceed to PR Entry</Text>
        <Text color="gray">  |  </Text>
        <Text color="white">Press [Esc] to Return</Text>
      </Box>
    </Box>
  );
}
