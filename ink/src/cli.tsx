#!/usr/bin/env node
import { parseGitHubPrUrl } from './core/github-url.js';
import React from 'react';
import { Command } from 'commander';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SYNTHETIC_REPORT, SYNTHETIC_PARTIAL_REPORT, getReportForRunId } from './fixtures/fixtures.js';
import { formatReportMarkdown, formatReportJson } from './core/report-formatter.js';
import type { LiveSnapshotReader } from './screens/LiveInspectionApp.js';

async function loadInkApplication() {
  const originalForceColor = process.env.FORCE_COLOR;
  const shouldTemporarilyDisableColor = Boolean(process.env.NO_COLOR) && originalForceColor === undefined;

  try {
    if (shouldTemporarilyDisableColor) {
      process.env.FORCE_COLOR = '0';
    }

    const { render } = await import('ink');
    const { App } = await import('./App.js');
    const { LiveInspectionApp } = await import('./screens/LiveInspectionApp.js');
    return { render, App, LiveInspectionApp };
  } finally {
    if (shouldTemporarilyDisableColor) {
      if (originalForceColor === undefined) {
        delete process.env.FORCE_COLOR;
      } else {
        process.env.FORCE_COLOR = originalForceColor;
      }
    }
  }
}

const { render, App, LiveInspectionApp } = await loadInkApplication();

export function createCliProgram(options: {
  exitOverride?: boolean;
  renderApp?: (element: React.ReactElement) => void;
  liveReader?: LiveSnapshotReader;
} = {}) {
  const program = new Command();
  if (options.exitOverride) {
    program.exitOverride();
  }
  const renderElement = options.renderApp || ((el: React.ReactElement) => render(el));

  program
    .name('codeguardian')
    .description('CodeGuardian — Bounded, multi-agent GitHub PR reviewer CLI (G00 Native Terminal TUI)')
    .version('0.1.0');

  program
    .command('auth')
    .description('Check authentication status and session credentials')
    .argument('[action]', 'Action to perform (status)', 'status')
    .action((action) => {
      if (action === 'status') {
        renderElement(<App initialScreen="auth" isDemo={true} />);
      } else {
        console.error(`Unknown auth action: ${action}. Use 'codeguardian auth status'.`);
        process.exitCode = 1;
      }
    });

  const reviewCommand = program
    .command('review')
    .description('Inspect an allowlisted GitHub pull request in live read-only or demo mode')
    .argument('<pr_url>', 'GitHub PR URL to review')
    .option('--demo', 'Run in safe synthetic demonstration mode', true)
    .option('--no-demo', 'Disable demo mode; use explicit --live for a real read-only inspection')
    .option('--live', 'Read a real allowlisted GitHub PR (read-only)')
    .action((prUrl, cmdOpts) => {
      if (cmdOpts.live && demoWasExplicit) {
        console.error('Error: Choose one mode: --demo or --live, not both.');
        process.exitCode = 1;
        return;
      }
      if (!cmdOpts.live && cmdOpts.demo === false) {
        console.error('Error: --no-demo does not enable live access; use explicit --live for allowlisted read-only inspection.');
        process.exitCode = 1;
        return;
      }
      const parsed = parseGitHubPrUrl(prUrl || '');
      if (!parsed) {
        console.error("Error: Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number");
        process.exitCode = 1;
        return;
      }
      if (cmdOpts.live) {
        if (parsed.owner.toLowerCase() !== 'pixelsworker' || parsed.repo.toLowerCase() !== 'codeguardian') {
          console.error('Error: Live inspection is limited to https://github.com/PixelsWorker/CodeGuardian.');
          process.exitCode = 1;
          return;
        }
        renderElement(<LiveInspectionApp prUrl={parsed.url} reader={options.liveReader} />);
        return;
      }
      renderElement(<App initialScreen="inspection" initialPrUrl={parsed.url} isDemo={cmdOpts.demo} />);
    });
  let demoWasExplicit = false;
  reviewCommand.on('option:demo', value => { if (value !== false) demoWasExplicit = true; });

  program
    .command('report')
    .description('Export a deterministic offline G00 demo recipe (no session storage)')
    .argument('<run_id>', 'Run ID of the review session')
    .option('-f, --format <format>', 'Export format (markdown or json)', 'markdown')
    .action((runId, cmdOpts) => {
      const report = getReportForRunId(runId);
      if (!report) {
        console.error(`Error: Run ID '${runId}' not found. Available demo run IDs: '${SYNTHETIC_REPORT.run_id}', '${SYNTHETIC_PARTIAL_REPORT.run_id}'.`);
        process.exitCode = 1;
        return;
      }
      const fmt = (cmdOpts.format || 'markdown').toLowerCase();
      if (fmt === 'json') {
        console.log(formatReportJson(report));
      } else if (fmt === 'markdown' || fmt === 'md') {
        console.log(formatReportMarkdown(report));
      } else {
        console.error(`Error: Unsupported format '${cmdOpts.format}'. Supported formats: markdown, json.`);
        process.exitCode = 1;
      }
    });

  program
    .command('publish')
    .description('Inspect dry-run publication for an offline G00 demo recipe')
    .argument('<run_id>', 'Run ID of the review to publish')
    .option('--dry-run', 'Preview without making external writes', true)
    .option('--no-dry-run', 'Disallow real publication (blocked in G00)')
    .action((runId, cmdOpts) => {
      if (cmdOpts.dryRun === false) {
        console.error("Error: Real publication mode is disabled in G00. Only --dry-run is supported.");
        process.exitCode = 1;
        return;
      }
      const report = getReportForRunId(runId);
      if (!report) {
        console.error(`Error: Run ID '${runId}' not found. Available demo run IDs: '${SYNTHETIC_REPORT.run_id}', '${SYNTHETIC_PARTIAL_REPORT.run_id}'.`);
        process.exitCode = 1;
        return;
      }
      renderElement(<App initialScreen="publish" initialReport={report} isDemo={true} />);
    });

  return program;
}

export function runCli(argv: string[] = process.argv) {
  const program = createCliProgram();
  if (argv.length <= 2) {
    return render(<App initialScreen="welcome" isDemo={true} />);
  }
  return program.parse(argv);
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  try {
    const entryReal = fs.realpathSync(process.argv[1]);
    const moduleReal = fs.realpathSync(fileURLToPath(import.meta.url));
    return entryReal === moduleReal;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  runCli(process.argv);
}
