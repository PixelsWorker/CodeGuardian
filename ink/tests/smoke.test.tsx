import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { SmokeApp } from '../src/SmokeApp.js';

describe('SmokeApp test', () => {
  it('renders expected text', () => {
    const { lastFrame } = render(<SmokeApp name="Verified" />);
    expect(lastFrame()).toContain('CodeGuardian Ink 8 Smoke Test: Verified');
  });
});
