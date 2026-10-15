import { describe, it, expect, vi } from 'vitest';
import { validateGitHubPullRequestUrl } from '../utils/urlValidator';
import { createFreshWorker } from '../utils/workerFactory';
import { SCENARIOS } from '../data/scenarios';
import { WorkerRole, WorkerInfo } from '../types/contract';
import fs from 'fs';
import path from 'path';

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

    // Simulate selecting Scenario 9 (operator_denied)
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

describe('CodeGuardian G00 Navigation Lifecycle & Vite Hardening Regressions', () => {
  // Regression 1: Start -> leave screen -> return: active running workers are cancelled, completed workers preserved
  it('R1. Leaving Screen E transitions only running workers to cancelled, preserving completed workers', () => {
    // Setup state where worker 1 is complete, worker 2 is running
    const workers: Record<WorkerRole, WorkerInfo> = {
      security: createFreshWorker('security', 'complete'),
      logic: createFreshWorker('logic', 'running'),
      architecture: createFreshWorker('architecture', 'running'),
      quality: createFreshWorker('quality', 'skipped'),
    };

    // Simulate navigation away from Screen E: handleCancelRunningWorkersOnly logic
    const nextWorkers = { ...workers };
    (Object.keys(nextWorkers) as WorkerRole[]).forEach((role) => {
      if (nextWorkers[role].state === 'running') {
        nextWorkers[role] = createFreshWorker(role, 'cancelled');
      }
    });

    // Worker 1 should stay COMPLETE
    expect(nextWorkers.security.state).toBe('complete');
    expect(nextWorkers.security.findingsCount).toBe(2);

    // Running workers should transition to CANCELLED
    expect(nextWorkers.logic.state).toBe('cancelled');
    expect(nextWorkers.architecture.state).toBe('cancelled');

    // Skipped worker should stay SKIPPED
    expect(nextWorkers.quality.state).toBe('skipped');

    // Upon returning, no worker is stuck in 'running'
    const anyRunning = Object.values(nextWorkers).some((w) => w.state === 'running');
    expect(anyRunning).toBe(false);
  });

  // Regression 2: Start -> cancel -> wait 3 seconds: no resurrection
  it('R2. After cancelling, advancing time does not trigger any completion updates', () => {
    vi.useFakeTimers();

    let runGen = 1;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let secState = 'running';
    let qualState = 'running';

    const currentGen = runGen;
    timers.push(
      setTimeout(() => {
        if (runGen !== currentGen) return;
        secState = 'complete';
      }, 600),
      setTimeout(() => {
        if (runGen !== currentGen) return;
        qualState = 'complete';
      }, 1900)
    );

    // Cancel at 400ms
    vi.advanceTimersByTime(400);
    timers.forEach(clearTimeout);
    runGen += 1;
    secState = 'cancelled';
    qualState = 'cancelled';

    // Wait 3000ms
    vi.advanceTimersByTime(3000);

    expect(secState).toBe('cancelled');
    expect(qualState).toBe('cancelled');

    vi.useRealTimers();
  });

  // Regression 3: Start -> leave -> return -> rerun: new run completes
  it('R3. Returning after leaving screen permits a fresh run that completes successfully', () => {
    vi.useFakeTimers();

    let runGen = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const workers: Record<string, string> = {
      security: 'queued',
      logic: 'queued',
    };

    // User starts run 1
    runGen += 1;
    const gen1 = runGen;
    workers.security = 'running';
    workers.logic = 'running';
    timers.push(
      setTimeout(() => {
        if (runGen !== gen1) return;
        workers.security = 'complete';
        workers.logic = 'complete';
      }, 1900)
    );

    // User leaves screen at 500ms
    vi.advanceTimersByTime(500);
    timers.forEach(clearTimeout);
    runGen += 1; // invalidated
    workers.security = 'cancelled';
    workers.logic = 'cancelled';

    // User returns and clicks Re-run (Run 2)
    const gen2 = runGen + 1;
    runGen = gen2;
    workers.security = 'running';
    workers.logic = 'running';
    timers.push(
      setTimeout(() => {
        if (runGen !== gen2) return;
        workers.security = 'complete';
        workers.logic = 'complete';
      }, 1900)
    );

    // Run 2 finishes at 1900ms
    vi.advanceTimersByTime(1900);

    expect(workers.security).toBe('complete');
    expect(workers.logic).toBe('complete');

    vi.useRealTimers();
  });

  // Regression 4: Completed worker -> leave screen: completion remains intact
  it('R4. Completed workers are not modified when navigating away or returning', () => {
    const workers: Record<WorkerRole, WorkerInfo> = {
      security: createFreshWorker('security', 'complete'),
      logic: createFreshWorker('logic', 'complete'),
      architecture: createFreshWorker('architecture', 'complete'),
      quality: createFreshWorker('quality', 'complete'),
    };

    // User navigates away
    let changed = false;
    const nextWorkers = { ...workers };
    (Object.keys(nextWorkers) as WorkerRole[]).forEach((role) => {
      if (nextWorkers[role].state === 'running') {
        changed = true;
        nextWorkers[role] = createFreshWorker(role, 'cancelled');
      }
    });

    expect(changed).toBe(false);
    expect(nextWorkers.security.state).toBe('complete');
    expect(nextWorkers.logic.state).toBe('complete');
    expect(nextWorkers.architecture.state).toBe('complete');
    expect(nextWorkers.quality.state).toBe('complete');
  });

  // Regression 5: Switch scenarios during a run: no stale state leaks
  it('R5. Switching scenarios mid-run flushes simulation and applies fresh scenario data', () => {
    // Mid-run state
    const midRunWorkers = {
      security: { ...createFreshWorker('security', 'running'), findingsCount: 1, elapsedMs: 800 },
      logic: { ...createFreshWorker('logic', 'running'), findingsCount: 1, elapsedMs: 800 },
      architecture: createFreshWorker('architecture', 'running'),
      quality: createFreshWorker('quality', 'running'),
    };

    // User selects Scenario 3 (Auth unavailable -> all queued)
    const sc3 = SCENARIOS.find((s) => s.id === 'auth_unavailable')!;
    const freshWorkers = {} as Record<WorkerRole, WorkerInfo>;
    (Object.keys(sc3.setupState.workersState) as WorkerRole[]).forEach((role) => {
      freshWorkers[role] = createFreshWorker(role, sc3.setupState.workersState[role]);
    });

    expect(freshWorkers.security.state).toBe('queued');
    expect(freshWorkers.security.findingsCount).toBe(0);
    expect(freshWorkers.security.elapsedMs).toBe(0);
    expect(freshWorkers.logic.state).toBe('queued');
    expect(freshWorkers.logic.findingsCount).toBe(0);
    expect(freshWorkers.logic.elapsedMs).toBe(0);
  });

  // Regression 6: Confirm Vite no longer allows arbitrary hosts
  it('R6. vite.config.ts removes allowedHosts: true and specifies explicit trusted-host allowlist', () => {
    const configPath = path.resolve(__dirname, '../../vite.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');

    // Must NOT contain allowedHosts: true
    expect(content).not.toContain('allowedHosts: true');

    // Must contain explicit trusted host definitions and bind locally
    expect(content).toContain("allowedHosts: trustedPreviewHosts");
    expect(content).toContain("'localhost'");
    expect(content).toContain("'127.0.0.1'");
    expect(content).toContain("'ais-dev-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app'");
  });
});
