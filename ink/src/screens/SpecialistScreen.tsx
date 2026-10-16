import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { WorkerInfo } from '../types/contracts.js';
import { ProgressBar } from '../components/ProgressBar.js';

interface SpecialistScreenProps {
  specialists: WorkerInfo[];
  onComplete: () => void;
  onFailLane: (role: string, reason: string) => void;
  onCancel: () => void;
}

export function SpecialistScreen({ specialists, onComplete, onFailLane, onCancel }: SpecialistScreenProps) {
  useInput((input, key) => {
    if (key.return) {
      onComplete();
    } else if (key.escape) {
      onCancel();
    } else if (input === 'f' || input === 'F') {
      onFailLane("quality", "Malformed AST parser exception in benchmark lane");
    }
  });

  const allComplete = specialists.every(s => s.state === "complete" || s.state === "failed");

  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="white">Multi-Agent Specialist Execution Lanes:</Text>
        <Text color="gray">Simulating bounded Codex specialist workers</Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1} marginBottom={1}>
        {specialists.map(worker => {
          let badge = <Text color="yellow">⏳ RUNNING</Text>;
          if (worker.state === "complete") {
            badge = <Text bold color="green">✓ COMPLETED ({worker.findingsCount} findings)</Text>;
          } else if (worker.state === "failed") {
            badge = <Text bold color="red">✗ FAILED</Text>;
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
                  color={worker.state === "failed" ? "red" : worker.state === "complete" ? "green" : "cyan"}
                />
              </Box>
              <Text color="gray">Activity: <Text color={worker.state === "failed" ? "red" : "white"}>{worker.currentActivity}</Text></Text>
            </Box>
          );
        })}
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold color="cyan">Interactive Scenario Controls:</Text>
        <Text color="white">• Press <Text bold color="yellow">[F]</Text> to simulate Partial Failure in Quality specialist lane</Text>
        <Text color="white">• Press <Text bold color="red">[Esc]</Text> to test User Cancellation</Text>
      </Box>

      <Box>
        <Text color="green" bold>Press [Enter] to Synthesize Findings & Manager Consensus</Text>
      </Box>
    </Box>
  );
}
