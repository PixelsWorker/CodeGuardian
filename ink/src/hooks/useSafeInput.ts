import { useInput, useStdin } from 'ink';
import { useEffect } from 'react';

export interface Key {
  return?: boolean;
  escape?: boolean;
  backspace?: boolean;
  delete?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
}

export type InputHandler = (input: string, key: Key) => void;

/**
 * useSafeInput wraps Ink's useInput hook with graceful fallback
 * when process.stdin is not in raw mode (e.g. redirected stdin in subprocesses/CI).
 */
export function useSafeInput(
  handler: InputHandler,
  options: { isActive?: boolean } = {}
) {
  const { isRawModeSupported, stdin } = useStdin();
  const isActive = (options.isActive ?? true) && isRawModeSupported;

  useInput(handler, { isActive });

  useEffect(() => {
    if (isRawModeSupported || options.isActive === false) {
      return;
    }

    const onData = (data: Buffer | string) => {
      const str = data.toString();
      let i = 0;
      while (i < str.length) {
        if (str.startsWith('\u001B[A', i)) {
          handler('', { upArrow: true });
          i += 3;
        } else if (str.startsWith('\u001B[B', i)) {
          handler('', { downArrow: true });
          i += 3;
        } else if (str.startsWith('\u001B[C', i)) {
          handler('', { rightArrow: true });
          i += 3;
        } else if (str.startsWith('\u001B[D', i)) {
          handler('', { leftArrow: true });
          i += 3;
        } else if (str.startsWith('\u001B[3~', i)) {
          handler('', { delete: true });
          i += 4;
        } else if (str[i] === '\u001B') {
          // If followed by CSI sequence that we didn't recognize, skip the whole sequence
          if (i + 1 < str.length && str[i + 1] === '[') {
            let j = i + 2;
            while (j < str.length && !/[a-zA-Z~]/.test(str[j])) {
              j++;
            }
            i = j < str.length ? j + 1 : str.length;
          } else {
            handler('', { escape: true });
            i++;
          }
        } else if (str[i] === '\r' || str[i] === '\n') {
          handler('', { return: true });
          i++;
        } else if (str[i] === '\u0008' || str[i] === '\u007F') {
          handler('', { backspace: true });
          i++;
        } else {
          handler(str[i], {});
          i++;
        }
      }
    };

    stdin.on('data', onData);
    return () => {
      stdin.off('data', onData);
    };
  }, [isRawModeSupported, stdin, handler, options.isActive]);
}
