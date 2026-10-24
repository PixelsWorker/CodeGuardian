import React from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { AuthState } from '../types/contracts.js';

interface AuthScreenProps {
  githubAuth: AuthState;
  codexAuth: AuthState;
  onContinue: () => void;
  onCycleAuth?: () => void;
  onBack: () => void;
}

export function AuthScreen({ githubAuth, codexAuth, onContinue, onCycleAuth, onBack }: AuthScreenProps) {
  const isAuthValid = githubAuth === "authenticated" && codexAuth === "authenticated";
  const { columns } = useWindowSize();
  const compact = columns < 72;
  const actionsCompact = compact || (!isAuthValid && columns < 97);
  const hasLongFailureBadge =
    githubAuth === 'insufficient_permissions' || codexAuth === 'insufficient_permissions';
  const hasNotAuthenticatedBadge =
    githubAuth === 'not_authenticated' || codexAuth === 'not_authenticated';
  const statusCardsCompact =
    columns < 96 ||
    (columns < 100 && (hasLongFailureBadge || hasNotAuthenticatedBadge)) ||
    (columns < 104 && hasLongFailureBadge);

  useSafeInput((input, key) => {
    if (input === 't' || input === 'T') {
      onCycleAuth?.();
      return;
    }
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
        <Box
          flexDirection={statusCardsCompact ? 'column' : 'row'}
          justifyContent={statusCardsCompact ? undefined : 'space-between'}
          alignItems={statusCardsCompact ? 'flex-start' : undefined}
          marginBottom={1}
        >
          <Box flexDirection="column">
            <Text bold color="white">GitHub CLI (gh) Session</Text>
            <Text color="gray">Required for read-only PR metadata, changed files, and diff inspection</Text>
          </Box>
          <Box>{getStatusBadge(githubAuth)}</Box>
        </Box>

        <Box
          flexDirection={statusCardsCompact ? 'column' : 'row'}
          justifyContent={statusCardsCompact ? undefined : 'space-between'}
          alignItems={statusCardsCompact ? 'flex-start' : undefined}
          marginTop={1}
        >
          <Box flexDirection="column">
            <Text bold color="white">Codex CLI / SDK Session</Text>
            <Text color="gray">Required for bounded specialist analysis lanes (ChatGPT login or API key)</Text>
          </Box>
          <Box>{getStatusBadge(codexAuth)}</Box>
        </Box>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">Authentication Remediation Instructions:</Text>
        <Text color="white">• If GitHub fails: Run <Text color="yellow">gh auth login -w</Text> (or <Text color="yellow">gh auth login -s repo</Text> for private repositories)</Text>
        <Text color="white">• If Codex fails: Run <Text color="yellow">codex login --device-auth</Text></Text>
        <Text color="gray">Note: In G00 DEMO mode, simulated credentials allow walkthrough testing.</Text>
      </Box>

      {(!isAuthValid) && (
        <Box marginBottom={1}>
          <Text color="yellow">⚠️  Preflight incomplete: Both services must be AUTHENTICATED before inspecting PRs.</Text>
        </Box>
      )}

      <Box flexDirection={actionsCompact ? 'column' : 'row'}>
        <Text color={isAuthValid ? "green" : "yellow"} bold>
          Press [Enter] {isAuthValid ? "Proceed" : "Verify Preflight (Blocked)"}
        </Text>
        {!actionsCompact && <Text color="gray">  |  </Text>}
        <Text color="yellow" bold>[T] Cycle Auth State (Demo)</Text>
        {!actionsCompact && <Text color="gray">  |  </Text>}
        <Text color="white">Press [Esc] Return</Text>
      </Box>
    </Box>
  );
}
