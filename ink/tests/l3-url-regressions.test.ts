import { describe, it, expect, afterEach, vi } from 'vitest';
import { parseGitHubPrUrl } from '../src/core/github-url.js';
import { cliReducer, createInitialState } from '../src/core/state-machine.js';
import { createCliProgram } from '../src/cli.js';

export const invalidUrls = [
  'https://github.com/acme/repo?tab=x/pull/1', 'https://github.com/acme/repo/pull/1?x=1',
  'https://github.com/acme/repo/pull/1#x', 'https://github.com/acme/repo/pull/1?',
  'https://github.com/acme/repo/pull/1#', 'http://github.com/acme/repo/pull/1',
  'https://gitlab.com/acme/repo/pull/1', 'https://github.com.evil.test/acme/repo/pull/1',
  'https://user:pass@github.com/acme/repo/pull/1', 'https://github.com/acme/repo/pull/0',
  'https://github.com/acme/repo/pull/-1', 'https://github.com/acme/repo/pull/1.5',
  'https://github.com/acme/repo/pull/9007199254740993', 'https://github.com/acme/repo/pull/',
  'https://github.com/acme/repo/pull/1/files', 'https://github.com/acme/repo/issues/1',
  'https://github.com/acme/re%2Fpo/pull/1', 'https://github.com/acme/re%3Fpo/pull/1',
  'https://github.com/acme/re po/pull/1', 'https://github.com/acme/re\tpo/pull/1',
  ' https://github.com/acme/repo/pull/1', 'https://github.com/acme/../repo/pull/1',
  'https://github.com/acme/repo/pull/01', 'https://github.com/-acme/repo/pull/1',
  'https://github.com/acme/repo/pull/1/', 'https://github.com/acme//pull/1',
  'https://github.com/acme/repo\\pull/1', 'https://github.com/acme/repo/pull/pull/1',
];
afterEach(() => { vi.restoreAllMocks(); process.exitCode = 0; });
describe('L3 — Shared strict offline URL parsing', () => {
  it.each(invalidUrls)('CLI and reducer both reject %s', url => {
    expect(parseGitHubPrUrl(url)).toBeNull();
    const state = cliReducer({ ...createInitialState(), prUrl: url }, { type: 'SUBMIT_PR_URL' });
    expect(state.urlError).toContain('Invalid GitHub PR URL');
    const renderApp = vi.fn(); vi.spyOn(console, 'error').mockImplementation(() => {});
    createCliProgram({ renderApp, exitOverride: true }).parse(['node', 'cli', 'review', url, '--demo']);
    expect(renderApp).not.toHaveBeenCalled(); expect(process.exitCode).toBe(1);
  });
  it.each(['my-org/my-repo/12', 'org12/re.po_12/123'])('accepts standard PR identity %s', identity => {
    const [owner, repo, number] = identity.split('/');
    const url = `https://github.com/${owner}/${repo}/pull/${number}`;
    expect(parseGitHubPrUrl(url)).toEqual({ owner, repo, number: Number(number), url });
    const state = cliReducer({ ...createInitialState(), prUrl: url }, { type: 'SUBMIT_PR_URL' });
    expect(state.prIdentity).toMatchObject({ owner, repo, number: Number(number), url });
    const renderApp = vi.fn(); createCliProgram({ renderApp }).parse(['node', 'cli', 'review', url]);
    expect(renderApp).toHaveBeenCalledOnce();
  });

  it.each([
    'https://github.com/draft-js/draft-js/pull/1',
    'https://github.com/closed-loop/system/pull/2',
    'https://github.com/forbidden-planet/space/pull/3',
    'https://github.com/rate-limiter/bucket/pull/4',
    'https://github.com/deleted-files/purge/pull/5',
    'https://github.com/unauthorized-access/audit/pull/6',
    'https://github.com/private-org/public/pull/2',
    'https://github.com/unauthorized-org/public/pull/1',
    'https://github.com/demo-org/other-repo/pull/404',
    'https://github.com/demo-org/other-repo/pull/99',
    'https://github.com/demo-org/other-repo/pull/429',
    'https://github.com/example/other-repo/pull/404',
  ])('does not falsely trigger simulated failure scenarios for custom repository %s', url => {
    const state = cliReducer({ ...createInitialState(), prUrl: url }, { type: 'SUBMIT_PR_URL' });
    expect(state.screen).toBe('inspection');
    expect(state.urlError).toBeNull();
    expect(state.runStatus).toBe('inspecting');
  });

  it.each([
    ['https://github.com/example/demo/pull/99', 'Draft Pull Request', 'blocked'],
    ['https://github.com/example/demo/pull/404', 'Pull Request Not Found', 'failed'],
    ['https://github.com/example/demo/pull/429', 'API Rate Limit Exceeded', 'blocked'],
    ['https://github.com/private-org/secret-repo/pull/1', 'Unauthorized Repository', 'blocked'],
  ])('triggers expected failure scenario for exact preset %s', (url, expectedMessage, expectedStatus) => {
    const state = cliReducer({ ...createInitialState(), prUrl: url }, { type: 'SUBMIT_PR_URL' });
    expect(state.screen).toBe('error');
    expect(state.runStatus).toBe(expectedStatus);
    expect(state.errorMessage).toContain(expectedMessage);
  });
});
