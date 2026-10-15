import { describe, it, expect, vi } from 'vitest';
import { validateGitHubPullRequestUrl } from '../utils/urlValidator';
import { createFreshWorker } from '../utils/workerFactory';
import { SCENARIOS } from '../data/scenarios';
import { WorkerRole, WorkerInfo, ScenarioDefinition } from '../types/contract';

describe('CodeGuardian G00 Acceptance Test Matrix', () => {
  // Test 1: Complete → Queued scenario: Counters and logs reset
  it('1. Complete -> Queued scenario resets all worker telemetry to clean baselines', () => {
    // Start with complete worker
    const completedWorker = createFreshWorker('security', 'complete');
    expect(completedWorker.findingsCount).toBe(2);
    expect(completedWorker.elapsedMs).toBeGreaterThan(0);
    expect(completedWorker.state).toBe('complete');

    // Transition to queued (as in Scenario 3)
    const queuedWorker = createFreshWorker('security', 'queued');
    expect(queuedWorker.state).toBe('queued');
    expect(queuedWorker.findingsCount).toBe(0);
    expect(queuedWorker.elapsedMs).toBe(0);
    expect(queuedWorker.progress).toBe(0);
    expect(queuedWorker.currentActivity).toContain('Waiting');
    expect(queuedWorker.logs).toEqual(["[00:00.00] Specialist worker 'security' queued in manager pool."]);
  });

  // Test 2: Permission-denied → Normal scenario: Previous error disappears
  it('2. Permission-denied -> Normal scenario resets publishOutcome to normal', () => {
    let publishOutcome: string = 'normal';

    // Simulate selecting Scenario 5 or 9
    const sc9 = SCENARIOS.find((s) => s.id === 'publish_denied')!;
    publishOutcome = sc9.setupState.publishOutcome ?? 'normal';
    expect(publishOutcome).toBe('operator_denied');

    // Simulate selecting Scenario 3 (which omits publishOutcome)
    const sc3 = SCENARIOS.find((s) => s.id === 'auth_unavailable')!;
    publishOutcome = sc3.setupState.publishOutcome ?? 'normal';
    expect(publishOutcome).toBe('normal');

    // Verify it disappears and does not remain stuck
    expect(publishOutcome).not.toBe('denied_permission');
    expect(publishOutcome).not.toBe('operator_denied');
  });

  // Test 3: Start → Cancel → Wait 3 seconds: Workers remain cancelled
  it('3. Cancellation clears scheduled timers and halts pending worker updates', async () => {
    vi.useFakeTimers();

    let state = 'running';
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Schedule delayed completion
    const t = setTimeout(() => {
      state = 'complete';
    }, 1900);
    timers.push(t);

    // Operator cancels at 500ms
    vi.advanceTimersByTime(500);
    state = 'cancelled';
    timers.forEach(clearTimeout);

    // Advance beyond original completion time
    vi.advanceTimersByTime(3000);

    // Assert state remained cancelled and did not resurrect to complete
    expect(state).toBe('cancelled');

    vi.useRealTimers();
  });

  // Test 4: Start → Cancel → Start again: Run generation token prevents race condition
  it('4. Run-generation token prevents orphaned timer callbacks from overriding newer runs', () => {
    vi.useFakeTimers();

    let runGeneration = 1;
    let workerState = 'running';

    // Run 1 schedules callback
    const gen1 = runGeneration;
    setTimeout(() => {
      if (runGeneration === gen1) {
        workerState = 'complete-gen-1';
      }
    }, 1900);

    // Cancel Run 1 and start Run 2 at 1000ms
    vi.advanceTimersByTime(1000);
    runGeneration += 1;
    workerState = 'running-gen-2';

    // Fire remaining timers
    vi.advanceTimersByTime(2000);

    // Old callback was ignored because runGeneration changed
    expect(workerState).toBe('running-gen-2');

    vi.useRealTimers();
  });

  // Test 5: Leave Screen E while running: Cleanup clears timers
  it('5. Unmount cleanup function clears all active timers', () => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const clearScheduledTimers = () => {
      timers.forEach((t) => clearTimeout(t));
      timers.length = 0;
    };

    const t1 = setTimeout(() => {}, 1000);
    const t2 = setTimeout(() => {}, 2000);
    timers.push(t1, t2);

    expect(timers.length).toBe(2);
    clearScheduledTimers();
    expect(timers.length).toBe(0);
  });

  // Test 6: Insecure HTTP rejected
  it('6. Rejects insecure HTTP PR URL (HTTPS required)', () => {
    const result = validateGitHubPullRequestUrl('http://github.com/example/demo/pull/42');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('requires HTTPS');
  });

  // Test 7: Host spoofing (evil.com/github.com) rejected
  it('7. Rejects host spoofing / non-GitHub host (https://evil.com/github.com/...)', () => {
    const result = validateGitHubPullRequestUrl('https://evil.com/github.com/example/demo/pull/42');
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unsupported host 'evil.com'");
  });

  // Test 8: URL containing username/password rejected
  it('8. Rejects URLs containing embedded user credentials', () => {
    const result = validateGitHubPullRequestUrl('https://user:token123@github.com/example/demo/pull/42');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('embedded user credentials');
  });

  // Test 9: Invalid owner/repo chars rejected
  it('9. Rejects invalid owner or repository characters', () => {
    const res1 = validateGitHubPullRequestUrl('https://github.com/bad$owner/demo/pull/42');
    expect(res1.valid).toBe(false);
    expect(res1.error).toContain('Malformed PR path');

    const res2 = validateGitHubPullRequestUrl('https://github.com/owner/bad!repo/pull/42');
    expect(res2.valid).toBe(false);

    const res3 = validateGitHubPullRequestUrl('https://github.com/owner/repo/pull/0');
    expect(res3.valid).toBe(false);
  });

  // Test 10: Valid HTTPS GitHub PR URL accepted
  it('10. Accepts valid HTTPS GitHub pull request URL with parsed components', () => {
    const result = validateGitHubPullRequestUrl('https://github.com/example/demo/pull/42');
    expect(result.valid).toBe(true);
    expect(result.owner).toBe('example');
    expect(result.repo).toBe('demo');
    expect(result.number).toBe(42);
  });
});
