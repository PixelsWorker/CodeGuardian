/** Offline G00 route validation; never resolves or contacts GitHub. */
export function parseGitHubPrUrl(input: string): { owner: string; repo: string; number: number; url: string } | null {
  // Reject normalization tricks before WHATWG URL removes whitespace, dot segments or backslashes.
  if (/[\s\\%?#]/.test(input) || !input.startsWith('https://github.com/')) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.host !== 'github.com' || url.username || url.password || url.search || url.hash) return null;
    const match = url.pathname.match(/^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9_.-]{1,100})\/pull\/([1-9][0-9]*)$/);
    if (!match || match[1].includes('--') || ['.', '..'].includes(match[2])) return null;
    const number = Number(match[3]);
    if (!Number.isSafeInteger(number) || url.href !== input) return null;
    return { owner: match[1], repo: match[2], number, url: input };
  } catch {
    return null;
  }
}
