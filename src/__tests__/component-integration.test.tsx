import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

describe('CodeGuardian G00 React Component Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // Test 1: Starting a run does not cancel it during ordinary parent re-renders
  it('1. Starting a simulation does not self-cancel during parent re-renders', async () => {
    render(<App />);

    // Navigate to Screen E (Workers)
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Re-run simulation
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Check that workers entered [RUNNING] state
    const runningBadges = screen.getAllByText(/\[RUNNING\]/i);
    expect(runningBadges.length).toBeGreaterThan(0);

    // Advance 650ms: Step 1 (Security & Logic) updates in parent state
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // Verify parent re-rendered without cancelling the simulation
    expect(screen.queryByText(/\[CANCELLED\]/i)).toBeNull();
    expect(screen.getByText(/Inspecting HMAC key initialization/i)).toBeDefined();
  });

  // Test 2: The real simulation advances and finishes after fake timers advance
  it('2. Real simulation advances deterministically and completes all workers at 1900ms', async () => {
    render(<App />);

    // Navigate to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Start simulation
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Advance through Step 1 (600ms)
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // Advance through Step 2 (1200ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText(/Auditing sessionStore lifecycle/i)).toBeDefined();

    // Advance through Step 3 completion (1900ms)
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // All 4 specialists must be marked [COMPLETE]
    const completeBadges = screen.getAllByText(/\[COMPLETE\]/i);
    expect(completeBadges.length).toBe(4);
    expect(screen.getByText(/All specialists finished/i)).toBeDefined();
  });

  // Test 3: Navigating away during an active run cancels only running workers
  it('3. Navigating away during an active run cancels only running workers', async () => {
    render(<App />);

    // Navigate to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Start simulation
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Advance to 650ms so Security and Logic complete partial, but Architecture & Quality are running
    act(() => {
      vi.advanceTimersByTime(650);
    });

    // User navigates away to Screen A (Welcome) while workers are still running
    act(() => {
      fireEvent.click(screen.getByText(/\[1\] Welcome/i));
    });

    // Return to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Any worker that was running when we navigated away must now be CANCELLED
    const cancelledBadges = screen.getAllByText(/\[CANCELLED\]/i);
    expect(cancelledBadges.length).toBeGreaterThan(0);

    // No worker should be left stuck in [RUNNING]
    expect(screen.queryByText(/\[RUNNING\]/i)).toBeNull();
  });

  // Test 4: Returning to Screen E permits another successful run
  it('4. Returning to Screen E after cancellation permits a fresh run that completes', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Start Run 1
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Leave screen mid-run
    act(() => {
      vi.advanceTimersByTime(300);
      fireEvent.click(screen.getByText(/\[1\] Welcome/i));
    });

    // Return to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Start Run 2
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Advance past completion (1900ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // All 4 workers should be complete
    const completeBadges = screen.getAllByText(/\[COMPLETE\]/i);
    expect(completeBadges.length).toBe(4);
  });

  // Test 5: Explicit cancellation prevents delayed completion callbacks
  it('5. Clicking Cancel [Ctrl+C] immediately stops execution with no delayed resurrection', async () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    // Cancel mid-run
    act(() => {
      vi.advanceTimersByTime(400);
      fireEvent.click(screen.getByText(/Cancel \[Ctrl\+C\]/i));
    });

    // Verify all workers show [CANCELLED]
    const cancelledBadges = screen.getAllByText(/\[CANCELLED\]/i);
    expect(cancelledBadges.length).toBe(4);

    // Advance time by 3000ms (way past the 1900ms completion timer)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Verify workers remain CANCELLED and did NOT change back to COMPLETE
    expect(screen.queryByText(/\[COMPLETE\]/i)).toBeNull();
    const finalCancelled = screen.getAllByText(/\[CANCELLED\]/i);
    expect(finalCancelled.length).toBe(4);
  });

  // Test 6: Switching scenarios does not retain stale worker states
  it('6. Switching from a completed scenario to a queued scenario clears telemetry and logs', async () => {
    render(<App />);

    // Start at Screen E where workers are completed by default
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });
    expect(screen.getAllByText(/\[COMPLETE\]/i).length).toBe(4);

    // Navigate to Screen I (Scenarios)
    act(() => {
      fireEvent.click(screen.getByText(/\[9\] Scenarios/i));
    });

    // Run Scenario 3: Authentication Unavailable (all workers queued)
    const runScenarioBtn = screen.getAllByText(/Run Scenario/i)[2]; // Scenario 3
    act(() => {
      fireEvent.click(runScenarioBtn);
    });

    // Navigate to Screen E to check worker status
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Workers must all be QUEUED with 0 candidates
    const queuedBadges = screen.getAllByText(/\[QUEUED\]/i);
    expect(queuedBadges.length).toBe(4);

    // Finding counts must be 0
    const candidateZeros = screen.getAllByText('0');
    expect(candidateZeros.length).toBeGreaterThanOrEqual(4);
  });

  // Test 7: Completed workers remain completed when navigating away
  it('7. Completed workers are not accidentally cancelled when navigating away', async () => {
    render(<App />);

    // Workers start complete
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });
    expect(screen.getAllByText(/\[COMPLETE\]/i).length).toBe(4);

    // Navigate away to Screen G (Report)
    act(() => {
      fireEvent.click(screen.getByText(/\[7\] Report/i));
    });

    // Navigate back to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Workers must still be COMPLETE
    expect(screen.getAllByText(/\[COMPLETE\]/i).length).toBe(4);
    expect(screen.queryByText(/\[CANCELLED\]/i)).toBeNull();
  });

  // Test 8: React StrictMode does not cause unexpected cancellation
  it('8. React StrictMode mounts and remounts without causing unexpected cancellation', async () => {
    render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Navigate to Screen E
    act(() => {
      fireEvent.click(screen.getByText(/\[5\] Workers/i));
    });

    // Initial state under StrictMode must remain COMPLETE (or initial state), not CANCELLED
    expect(screen.getAllByText(/\[COMPLETE\]/i).length).toBe(4);
    expect(screen.queryByText(/\[CANCELLED\]/i)).toBeNull();

    // Can run simulation normally in StrictMode
    act(() => {
      fireEvent.click(screen.getByText(/Re-run Simulation/i));
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Reaches COMPLETE without self-cancellation
    expect(screen.getAllByText(/\[COMPLETE\]/i).length).toBe(4);
  });
});
