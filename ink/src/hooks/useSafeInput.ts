import { useInput, useStdin } from 'ink';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { StringDecoder } from 'node:string_decoder';

export interface Key {
  return?: boolean; escape?: boolean; backspace?: boolean; delete?: boolean;
  upArrow?: boolean; downArrow?: boolean; leftArrow?: boolean; rightArrow?: boolean;
  ctrl?: boolean; meta?: boolean; shift?: boolean;
}
export type InputHandler = (input: string, key: Key) => void;

/** Streaming non-raw parser. A short timeout distinguishes bare Escape from CSI.
 * CR state survives chunk boundaries; UTF-8 decoding survives split bytes. */
export function createInputParser(handler: InputHandler) {
  let pending = '';
  let afterCR = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const decoder = new StringDecoder('utf8');
  const clearTimer = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const process = () => {
    while (pending) {
      const ch = pending[0];
      if (afterCR) {
        afterCR = false;
        if (ch === '\n') { pending = pending.slice(1); continue; }
      }
      if (ch === '\u001b') {
        if (pending.length === 1 || pending[1] === 'O' && pending.length === 2 || pending[1] === '[' && !/[\x40-\x7e]/.test(pending.slice(2))) {
          // Bound both waiting time and abandoned CSI buffers.
          timer = setTimeout(() => {
            const bareEscape = pending === '\u001b';
            pending = ''; timer = undefined;
            if (bareEscape) handler('', { escape: true });
          }, 50);
          return;
        }
        // Application-cursor mode uses SS3 (ESC O A-D), not CSI.
        if (pending[1] === 'O') {
          const arrows: Record<string, Key> = { A: { upArrow: true }, B: { downArrow: true }, C: { rightArrow: true }, D: { leftArrow: true } };
          const key = arrows[pending[2]];
          pending = pending.slice(3);
          if (key) handler('', key);
          continue;
        }
        if (pending[1] === '[') {
          const match = pending.match(/^\u001b\[[\x20-\x3f]*([\x40-\x7e])/);
          if (match) {
            const keys: Record<string, Key> = { A: { upArrow: true }, B: { downArrow: true }, C: { rightArrow: true }, D: { leftArrow: true }, '3~': { delete: true } };
            const key = keys[match[0].slice(2)];
            pending = pending.slice(match[0].length);
            if (key) handler('', key);
          } else { pending = pending.slice(2); }
        } else { pending = pending.slice(1); handler('', { escape: true }); }
      } else if (ch === '\r' || ch === '\n') {
        pending = pending.slice(1); afterCR = ch === '\r'; handler('', { return: true });
      } else if (ch === '\u0008' || ch === '\u007f') {
        pending = pending.slice(1); handler('', { backspace: true });
      } else {
        // Commands are single keys even when stdin merges them into one chunk.
        // PR edits remain safe because the reducer applies each edit to current state.
        const codePoint = String.fromCodePoint(pending.codePointAt(0)!);
        pending = pending.slice(codePoint.length);
        if (!/[\u0000-\u001f\u007f]/.test(codePoint)) handler(codePoint, {});
      }
    }
  };
  return {
    write(data: Buffer | string) {
      clearTimer();
      pending += typeof data === 'string' ? data : decoder.write(data);
      process();
    },
    dispose() { clearTimer(); pending = ''; afterCR = false; decoder.end(); },
  };
}

// One parser per input stream prevents global/screen handlers from independently
// interpreting CRLF and CSI. The global App subscriber spans screen remounts.
type Stream = ReturnType<typeof useStdin>['stdin'];
const streams = new WeakMap<Stream, { handlers: Set<InputHandler>; parser: ReturnType<typeof createInputParser> }>();
export function useSafeInput(handler: InputHandler, options: { isActive?: boolean } = {}) {
  const { isRawModeSupported, stdin } = useStdin();
  const latest = useRef(handler);
  useLayoutEffect(() => { latest.current = handler; });
  useInput(handler, { isActive: (options.isActive ?? true) && isRawModeSupported });
  useEffect(() => {
    if (isRawModeSupported || options.isActive === false) return;
    let shared = streams.get(stdin);
    if (!shared) {
      const handlers = new Set<InputHandler>();
      const parser = createInputParser((input, key) => { for (const callback of [...handlers]) callback(input, key); });
      shared = { handlers, parser };
      streams.set(stdin, shared);
      stdin.on('data', parser.write);
    }
    const callback: InputHandler = (input, key) => latest.current(input, key);
    shared.handlers.add(callback);
    return () => {
      shared.handlers.delete(callback);
      if (!shared.handlers.size) {
        stdin.off('data', shared.parser.write);
        shared.parser.dispose();
        streams.delete(stdin);
      }
    };
  }, [isRawModeSupported, stdin, options.isActive]);
}
