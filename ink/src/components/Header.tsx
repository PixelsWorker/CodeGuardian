import React from 'react';
import { Box, Text, useWindowSize } from 'ink';
import { ActiveScreen } from '../types/contracts.js';

interface HeaderProps {
  screen: ActiveScreen;
  prTitle?: string;
  prNumber?: number;
  isDemo?: boolean;
}

const SCREEN_TITLES: Record<ActiveScreen, string> = {
  welcome: "1. Welcome & CLI Overview",
  auth: "2. Authentication Preflight",
  pr_input: "3. PR URL Entry & Validation",
  inspection: "4. PR Diff Inspection & Risk Overview",
  specialist: "5. Specialist Multi-Agent Execution",
  consensus: "6. Manager Consensus & Deduplication",
  report: "7. Synthesized Review Report",
  publish: "8. Dry-Run Publication Confirmation",
  error: "9. System Error / Cancellation",
};

export function Header({ screen, prTitle, prNumber, isDemo = true }: HeaderProps) {
  const { columns } = useWindowSize();
  const compact = columns < 72;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="single" borderColor="cyan" paddingX={1} flexDirection={compact ? 'column' : 'row'} justifyContent="space-between">
        <Box flexDirection={compact ? 'column' : 'row'}>
          <Text bold color="cyan">🛡️  CodeGuardian</Text>
          {!compact && <Text color="gray"> | </Text>}
          <Text bold color="white">{SCREEN_TITLES[screen]}</Text>
        </Box>
        <Box alignItems={compact ? 'flex-start' : 'flex-end'}>
          {isDemo && (
            <Text bold color="black" backgroundColor="yellow">
              {" DEMO ONLY "}
            </Text>
          )}
        </Box>
      </Box>
      {prTitle && prNumber && (
        <Box paddingX={1}>
          <Text color="gray">Target: <Text color="white">#{prNumber} — {prTitle}</Text></Text>
        </Box>
      )}
    </Box>
  );
}
