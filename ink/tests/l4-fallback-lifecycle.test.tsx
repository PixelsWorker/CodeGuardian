import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { useReducer, useState } from 'react';
import { PassThrough } from 'node:stream';
import { render, cleanup } from 'ink-testing-library';
import { Text } from 'ink';
import { useSafeInput } from '../src/hooks/useSafeInput.js';
import { cliReducer, createInitialState } from '../src/core/state-machine.js';
import { PrEntryScreen } from '../src/screens/PrEntryScreen.js';

const stream = new PassThrough();
vi.mock('ink', async importOriginal => {
  const actual = await importOriginal<typeof import('ink')>();
  return { ...actual, useInput: vi.fn(), useStdin: () => ({ stdin: stream, isRawModeSupported: false }) };
});
const wait = () => new Promise(r => setTimeout(r, 80));
function Harness() {
  const [showEditor, setShowEditor] = useState(true);
  const [state, dispatch] = useReducer(cliReducer, { ...createInitialState(), screen: 'pr_input' as const, prUrl: '' });
  useSafeInput((_input, key) => {
    if (key.escape) setShowEditor(false);
    if (key.upArrow) setShowEditor(true);
  });
  return <>
    {showEditor && <PrEntryScreen prUrl={state.prUrl} error={state.urlError} onEditUrl={edit => dispatch({ type: 'EDIT_PR_URL', ...edit })} onSubmit={() => dispatch({ type: 'SUBMIT_PR_URL' })} onBack={() => {}} />}
    <Text>{JSON.stringify({ url: state.prUrl, owner: state.prIdentity.owner, repo: state.prIdentity.repo, number: state.prIdentity.number, screen: state.screen })}</Text>
  </>;
}
afterEach(cleanup);
describe('L4 — Actual fallback hook lifecycle and batching', () => {
  it.each(['whole', 'split', 'rapid'])('preserves %s stdin URL and submits current reducer state', async mode => {
    const app = render(<Harness />); await wait();
    expect(stream.listenerCount('data')).toBe(1);
    const url = 'https://github.com/q-org/my-repo/pull/123';
    const chunks = mode === 'whole' ? [url] : mode === 'rapid' ? [...url] : [url.slice(0, 24), url.slice(24)];
    for (const chunk of chunks) stream.emit('data', Buffer.from(chunk));
    stream.emit('data', Buffer.from('xy\u007f\u0008\r\n')); await wait();
    expect(app.lastFrame()!.replace(/\s/g, '')).toContain(JSON.stringify({ url, owner: 'q-org', repo: 'my-repo', number: 123, screen: 'inspection' }));
    app.unmount(); expect(stream.listenerCount('data')).toBe(0);
  });
  it('shares CRLF/CSI state across child remounts without duplicate listeners', async () => {
    const app = render(<Harness />); await wait();
    for (let i = 0; i < 3; i++) {
      stream.emit('data', '\u001b'); await wait();
      expect(app.lastFrame()).not.toContain('Enter Target');
      expect(stream.listenerCount('data')).toBe(1);
      stream.emit('data', '\u001b'); stream.emit('data', '['); stream.emit('data', 'A'); await wait();
      expect(app.lastFrame()).toContain('Enter Target');
      expect(stream.listenerCount('data')).toBe(1);
    }
    stream.emit('data', 'custom'); await wait();
    expect(app.lastFrame()).toContain('"url":"custom"');
    stream.emit('data', '\u001b['); app.unmount();
    expect(stream.listenerCount('data')).toBe(0);
    await wait(); expect(stream.listenerCount('data')).toBe(0);
  });
});
