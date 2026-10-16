import React from 'react';
import { Box, Text } from 'ink';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { WorkerInfo } from '../types/contracts.js';
import { ProgressBar } from '../components/ProgressBar.js';

interface SpecialistScreenProps {
  specialists: WorkerInfo[];
  onComplete: () => void;
  onFailLane: (role: string, reason: string) => void;
  onTimeoutLane?: (role: string, reason?: string) => void;
  onSkipLane?: (role: string, reason?: string) => void;
  onStepProgress?: () => void;
  onCancel: () => void;
}

export function SpecialistScreen({
  specialists,
  onComplete,
  onFailLane,
  onTimeoutLane,
  onSkipLane,
  onStepProgress,
  onCancel,
}: SpecialistScreenProps) {
  useSafeInput((input, key) => {
    if (key.return) {
      onComplete();
    } else if (key.escape) {
      onCancel();
    } else if (input === ' ') {
      onStepProgress?.();
    } else if (input === 'f' || input === 'F') {
      onFailLane("quality", "Malformed AST parser exception in benchmark lane");
    } else if (input === 't' || input === 'T') {
      onTimeoutLane?.("architecture", "Worker exceeded 60s timeout budget");
    } else if (input === 'k' || input === 'K') {
      onSkipLane?.("quality", "No benchmark fixtures present in PR diff");
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="white">Multi-Agent Specialist Execution Lanes:</Text>
        <Text color="gray">Simulating bounded Codex specialist workers</Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
        {specialists.map(worker => {
          let badge = <Text color="cyan">⚡ RUNNING ({worker.progress}%)</Text>;
          let barColor: "red" | "green" | "cyan" | "yellow" = "cyan";

          if (worker.state === "complete") {
            badge = <Text bold color="green">✓ COMPLETED ({worker.findingsCount} findings)</Text>;
            barColor = "green";
          } else if (worker.state === "failed") {
            badge = <Text bold color="red">✗ FAILED</Text>;
            barColor = "red";
          } else if (worker.state === "timed_out") {
            badge = <Text bold color="yellow">⏱ TIMED OUT</Text>;
            barColor = "yellow";
          } else if (worker.state === "skipped") {
            badge = <Text color="gray">↷ SKIPPED</Text>;
            barColor = "cyan";
          } else if (worker.state === "queued") {
            badge = <Text color="gray">⏳ QUEUED</Text>;
            barColor = "cyan";
          } else if (worker.state === "cancelled") {
            badge = <Text color="gray">⛔ CANCELLED</Text>;
            barColor = "red";
          }

          return (
            <Box key={worker.role} flexDirection="column" marginY={1}>
              <Box justifyContent="space-between">
                <Text bold color="white">{worker.displayName}</Text>
                {badge}
              </Box>
              <Text color="gray">{worker.description}</Text>
              <Box marginY={1}>
                <ProgressBar
                  progress={worker.progress}
                  color={barColor}
                />
              </Box>
              <Text color="gray">Activity: <Text color={worker.state === "failed" ? "red" : worker.state === "timed_out" ? "yellow" : "white"}>{worker.currentActivity}</Text></Text>
            </Box>
          );
        })}
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">Interactive Scenario Controls:</Text>
        <Text color="white">• Press <Text bold color="cyan">[Space]</Text> to step/advance streaming worker progress</Text>
        <Text color="white">• Press <Text bold color="yellow">[F]</Text> to simulate Partial Failure (Quality lane)</Text>
        <Text color="white">• Press <Text bold color="yellow">[T]</Text> to simulate Worker Timeout (Architecture lane)</Text>
        <Text color="white">• Press <Text bold color="gray">[K]</Text> to simulate Worker Skip (Quality lane)</Text>
        <Text color="white">• Press <Text bold color="red">[Esc]</Text> to test User Cancellation</Text>
      </Box>

      <Box>
        <Text color="green" bold>Press [Enter] to Synthesize Findings & Manager Consensus</Text>
      </Box>
    </Box>
  );
}
