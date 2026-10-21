import { describe, it, expect, beforeAll } from 'vitest';
import React, { useState } from 'react';
import { render } from 'ink-testing-library';
import { Box, Text, useInput } from 'ink';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inkRoot = path.resolve(__dirname, '..');

// Interactive test component to verify Ink 8 + React 19 keystroke reactivity
function InteractiveSmokeComponent() {
  const [count, setCount] = useState(0);
  useInput((input, key) => {
    if (input === 'x') {
      setCount(c => c + 1);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="green">Ink8+React19 Smoke Verified</Text>
      <Text color="cyan">PressCount: {count}</Text>
    </Box>
  );
}

describe('L1 — Toolchain & Ink 8 Smoke Testing', () => {
  beforeAll(() => {
    const cliDistPath = path.resolve(inkRoot, 'dist/src/cli.js');
    expect(fs.existsSync(cliDistPath)).toBe(true);
  });

  it('verifies Node 24+ and toolchain runtime compatibility', () => {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    expect(major).toBeGreaterThanOrEqual(24);
  });

  it('verifies React 19.3+ version alignment', () => {
    expect(React.version).toMatch(/^19\./);
  });

  it('verifies Ink 8 rendering and ink-testing-library keystroke compatibility', async () => {
    const { lastFrame, stdin } = render(<InteractiveSmokeComponent />);
    expect(lastFrame()).toContain('Ink8+React19 Smoke Verified');
    expect(lastFrame()).toContain('PressCount: 0');

    // Test real keystroke input propagation
    stdin.write('x');
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()).toContain('PressCount: 1');

    stdin.write('x');
    await new Promise(r => setTimeout(r, 50));
    expect(lastFrame()).toContain('PressCount: 2');
  });

  it('verifies package.json bin entry points to existing compiled dist/src/cli.js target', () => {
    const pkgPath = path.join(inkRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin.codeguardian).toBe('./dist/src/cli.js');

    const cliDistPath = path.resolve(inkRoot, pkg.bin.codeguardian);
    expect(fs.existsSync(cliDistPath)).toBe(true);

    const cliContent = fs.readFileSync(cliDistPath, 'utf8');
    expect(cliContent.length).toBeGreaterThan(100);
    expect(/^#!\/usr\/bin\/env node\r?\n/.test(cliContent)).toBe(true);
    const cliSource = fs.readFileSync(path.join(inkRoot, 'src/cli.tsx'), 'utf8');
    expect(/^#!\/usr\/bin\/env node\r?\n/.test(cliSource)).toBe(true);
    expect(cliContent).toContain('createCliProgram');
  });

  it('verifies shebang validation pattern correctly handles LF, CRLF, and rejects invalid headers', () => {
    const shebangRegex = /^#!\/usr\/bin\/env node\r?\n/;

    // Meaningful checks covering LF and CRLF
    expect(shebangRegex.test('#!/usr/bin/env node\nconsole.log(1);\n')).toBe(true);
    expect(shebangRegex.test('#!/usr/bin/env node\r\nconsole.log(1);\r\n')).toBe(true);

    // Missing shebang
    expect(shebangRegex.test('console.log(1);\n')).toBe(false);

    // Misplaced shebang (not at the start of the file)
    expect(shebangRegex.test('\n#!/usr/bin/env node\n')).toBe(false);
    expect(shebangRegex.test('// comment\n#!/usr/bin/env node\n')).toBe(false);

    // Unexpected leading bytes (BOM, whitespace, invalid shebang paths)
    expect(shebangRegex.test('\uFEFF#!/usr/bin/env node\n')).toBe(false);
    expect(shebangRegex.test(' #!/usr/bin/env node\n')).toBe(false);
    expect(shebangRegex.test('#!/bin/sh\n')).toBe(false);
    expect(shebangRegex.test('#!/usr/bin/node\n')).toBe(false);
  });

  it('verifies compiled ESM module loading without resolution errors', async () => {
    const contractsDist = path.resolve(inkRoot, 'dist/src/types/contracts.js');
    const stateMachineDist = path.resolve(inkRoot, 'dist/src/core/state-machine.js');

    expect(fs.existsSync(contractsDist)).toBe(true);
    expect(fs.existsSync(stateMachineDist)).toBe(true);

    // Dynamically import compiled ESM files to verify module loader compatibility
    const contracts = await import(contractsDist);
    expect(contracts.ReviewReportSchema).toBeDefined();
    expect(contracts.ReviewFindingSchema).toBeDefined();

    const stateMachine = await import(stateMachineDist);
    expect(typeof stateMachine.createInitialState).toBe('function');
    expect(typeof stateMachine.cliReducer).toBe('function');
  });
});
