import { describe, it, expect, afterEach, vi } from 'vitest';
import React, { useReducer } from 'react';
import { render, cleanup } from 'ink-testing-library';
import { Text } from 'ink';
import { createInputParser, useSafeInput, type Key } from '../src/hooks/useSafeInput.js';
import { cliReducer, createInitialState } from '../src/core/state-machine.js';
import { PrEntryScreen } from '../src/screens/PrEntryScreen.js';
import { App } from '../src/App.js';

const url = 'https://github.com/my-q-org/my-repo/pull/123';
const wait = () => new Promise(r => setTimeout(r, 80));
function Editor() {
  const [state, dispatch] = useReducer(cliReducer, { ...createInitialState(), screen: 'pr_input' as const, prUrl: '' });
  return <><PrEntryScreen prUrl={state.prUrl} error={state.urlError} onEditUrl={edit => dispatch({ type: 'EDIT_PR_URL', ...edit })} onSubmit={() => dispatch({ type: 'SUBMIT_PR_URL' })} onBack={() => {}} /><Text>{JSON.stringify({ url: state.prUrl, owner: state.prIdentity.owner, repo: state.prIdentity.repo, number: state.prIdentity.number, screen: state.screen })}</Text></>;
}
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('L4 — Input integrity and stream boundaries', () => {
  it.each([{ chunks: [url] }, { chunks: [url.slice(0, 19), url.slice(19, 33), url.slice(33)] }, { chunks: [...url] }])('keeps a complete URL with rapid raw text events $chunks', async ({ chunks }) => {
    const app = render(<Editor />);
    for (const chunk of chunks) app.stdin.write(chunk);
    app.stdin.write('\r'); await wait();
    const flat = app.lastFrame()!.replace(/\s/g, '');
    expect(flat).toContain(JSON.stringify({ url, owner: 'my-q-org', repo: 'my-repo', number: 123, screen: 'inspection' }));
  });
  it('applies multiple backspaces and delete against current reducer text', async () => {
    const app = render(<Editor />);
    app.stdin.write(url + 'xy'); app.stdin.write('\u007f'); app.stdin.write('\u0008');
    app.stdin.write('\u001b[3~'); app.stdin.write('3'); app.stdin.write('\r'); await wait();
    expect(app.lastFrame()!.replace(/\s/g, '')).toContain(JSON.stringify({ url, owner: 'my-q-org', repo: 'my-repo', number: 123, screen: 'inspection' }));
  });
  it.each(['constructor', 'toString', 'valueOf'])('treats pasted inherited property %s as text', async text => {
    const app = render(<Editor />); app.stdin.write(text); await wait();
    expect(app.lastFrame()).toContain(`"url":"${text}"`);
  });
  it('does not treat demo shortcut symbols as replacements in custom text', async () => {
    const app = render(<Editor />); app.stdin.write('custom');
    for (const char of '!@#$%') app.stdin.write(char);
    await wait(); expect(app.lastFrame()).toContain('custom!@#$%');
  });
  it('does not exit globally for q/Q while editing a URL', async () => {
    const app = render(<App initialScreen="pr_input" />);
    app.stdin.write('qQ'); await wait(); expect(app.lastFrame()).toContain('/pull/42qQ');
    app.stdin.write('\u007f'); app.stdin.write('\u007f'); app.stdin.write('\r'); await wait();
    expect(app.lastFrame()).toContain('PR #42:');
  });
  it('preserves non-raw whole and split chunks plus submission before rendering', () => {
    for (const chunks of [[url], [...url], [url.slice(0, 25), url.slice(25)]]) {
      let state: ReturnType<typeof createInitialState> = { ...createInitialState(), screen: 'pr_input', prUrl: '' };
      const parser = createInputParser((text, key) => {
        state = cliReducer(state, key.return ? { type: 'SUBMIT_PR_URL' } : key.backspace || key.delete ? { type: 'EDIT_PR_URL', backspace: true } : { type: 'EDIT_PR_URL', text });
      });
      for (const chunk of chunks) parser.write(Buffer.from(chunk));
      parser.write(Buffer.from('xx\u007f\u0008\r\nabc'));
      expect(state.prUrl).toBe(url);
      expect(state.prIdentity).toMatchObject({ owner: 'my-q-org', repo: 'my-repo', number: 123, url });
      expect(state.screen).toBe('inspection'); parser.dispose();
    }
  });
  it('buffers every arrow fragment and delete without premature Escape', () => {
    vi.useFakeTimers(); const events: Array<[string, Key]> = [];
    const parser = createInputParser((text, key) => events.push([text, key]));
    for (const char of ['\u001b', '[', 'A', '\u001b[B', '\u001b', '[', 'C', '\u001b', '[D', '\u001b[', '3', '~']) { parser.write(char); vi.advanceTimersByTime(10); }
    expect(events).toEqual([['', { upArrow: true }], ['', { downArrow: true }], ['', { rightArrow: true }], ['', { leftArrow: true }], ['', { delete: true }]]);
    parser.write('\u001b'); vi.advanceTimersByTime(49); expect(events).toHaveLength(5);
    vi.advanceTimersByTime(1); expect(events.at(-1)).toEqual(['', { escape: true }]);
    parser.write('\u001b['); parser.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('emits merged single-key commands individually without splitting Unicode code points', () => {
    const handler = vi.fn(); const parser = createInputParser(handler);
    parser.write(Buffer.from('yqnqmje😀'));
    expect(handler.mock.calls).toEqual([...Array.from('yqnqmje😀')].map(char => [char, {}]));
    parser.dispose();
  });
  it('recognizes whole and fragmented SS3 arrows without emitting Escape or URL text', () => {
    vi.useFakeTimers(); const handler = vi.fn(); const parser = createInputParser(handler);
    parser.write('\u001bOA'); parser.write('\u001b'); vi.advanceTimersByTime(10);
    parser.write('O'); vi.advanceTimersByTime(10); parser.write('B');
    parser.write('\u001bO'); parser.write('C'); parser.write('\u001bOD');
    expect(handler.mock.calls).toEqual([['', { upArrow: true }], ['', { downArrow: true }], ['', { rightArrow: true }], ['', { leftArrow: true }]]);
    parser.write('\u001bO'); vi.advanceTimersByTime(50);
    expect(handler).toHaveBeenCalledTimes(4); parser.dispose();
  });
  it('coalesces split CRLF and preserves split UTF-8', () => {
    const handler = vi.fn(); const parser = createInputParser(handler);
    parser.write('\r'); parser.write('\n'); parser.write('\r\n');
    const bytes = Buffer.from('é'); parser.write(bytes.subarray(0, 1)); parser.write(bytes.subarray(1));
    expect(handler.mock.calls).toEqual([['', { return: true }], ['', { return: true }], ['é', {}]]); parser.dispose();
  });
  it('does not multiply raw listeners across repeated screen mounts', async () => {
    const app = render(<App initialScreen="pr_input" />);
    const count = app.stdin.listenerCount('data');
    for (let i = 0; i < 3; i++) {
      app.stdin.write('\u001b'); await wait(); app.stdin.write('\r'); await wait();
      expect(app.stdin.listenerCount('data')).toBe(count);
    }
    app.stdin.write('x'); await wait(); expect(app.lastFrame()).toContain('/pull/42x');
    expect(app.lastFrame()).not.toContain('/pull/42xx');
  });
});
