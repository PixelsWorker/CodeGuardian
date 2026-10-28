import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { Header } from '../components/Header.js';
import { useSafeInput } from '../hooks/useSafeInput.js';
import { readGitHubPullRequestSnapshot, type GitHubReadResult } from '../core/live-github-reader.js';
import { InspectScreen } from './InspectScreen.js';

export type LiveSnapshotReader = (url: string, options?: { signal?: AbortSignal }) => Promise<GitHubReadResult>;

interface LiveInspectionAppProps {
  prUrl: string;
  reader?: LiveSnapshotReader;
}

type ViewState =
  | { phase: 'loading' }
  | { phase: 'result'; result: GitHubReadResult };

/** A successful read exits with status 0; quitting during or after a failed read exits with status 1. */
export function LiveInspectionApp({ prUrl, reader = readGitHubPullRequestSnapshot }: LiveInspectionAppProps) {
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState<ViewState>({ phase: 'loading' });
  const controller = useRef<AbortController | null>(null);
  const { exit } = useApp();

  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    setView({ phase: 'loading' });
    void reader(prUrl, { signal: request.signal }).then(result => {
      if (!request.signal.aborted) setView({ phase: 'result', result });
    }).catch(() => {
      if (!request.signal.aborted) {
        setView({ phase: 'result', result: { ok: false, kind: 'command_failed', message: 'Inspection failed unexpectedly. Retry the read-only request.' } });
      }
    });
    return () => {
      request.abort();
      if (controller.current === request) controller.current = null;
    };
  }, [prUrl, reader, attempt]);

  useSafeInput((input, key) => {
    if (input === 'q' || input === 'Q') {
      if (view.phase === 'loading') controller.current?.abort();
      if (view.phase === 'loading' || !view.result.ok) process.exitCode = 1;
      exit();
    }
    if (view.phase === 'loading' && (key.escape || input === 'c' || input === 'C')) {
      controller.current?.abort();
      setView({ phase: 'result', result: { ok: false, kind: 'cancelled', message: 'Inspection was cancelled. Press [R] to retry.' } });
    }
    if (view.phase === 'result' && !view.result.ok && (input === 'r' || input === 'R')) setAttempt(value => value + 1);
  });

  return (
    <Box flexDirection="column" minHeight={20}>
      <Header screen="inspection" isDemo={false} mode="live" />
      {view.phase === 'loading' ? (
        <Box flexDirection="column" padding={1}>
          <Text color="cyan">Reading allowlisted GitHub PR through read-only GitHub CLI requests…</Text>
          <Text color="gray">No repository checkout, worker execution or GitHub write is performed.</Text>
          <Text color="gray">Press [Esc] or [C] to cancel · [Q] to exit</Text>
        </Box>
      ) : view.result.ok ? (
        <InspectScreen snapshot={view.result.snapshot} pr={view.result.snapshot.identity} onStartAnalysis={() => {}} onBack={exit} />
      ) : (
        <Box flexDirection="column" padding={1}>
          <Text bold color="red">Live inspection failed · {view.result.kind}</Text>
          <Text color="white">{view.result.message}</Text>
          <Text color="gray">No synthetic findings or worker results were created.</Text>
          <Text color="gray">Press [R] to retry · [Q] to exit</Text>
        </Box>
      )}
    </Box>
  );
}
