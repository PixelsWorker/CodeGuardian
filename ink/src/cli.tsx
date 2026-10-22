#!/usr/bin/env node
import { parseGitHubPrUrl } from './core/github-url.js';
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { App } from './App.js';
import { SYNTHETIC_REPORT, SYNTHETIC_PARTIAL_REPORT, getReportForRunId } from './fixtures/fixtures.js';
import { formatReportMarkdown, formatReportJson } from './core/report-formatter.js';

export function createCliProgram(options: {
  exitOverride?: boolean;
  renderApp?: (element: React.ReactElement) => void;
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

  program
    .command('review')
    .description('Start interactive multi-agent pull request review')
    .argument('<pr_url>', 'GitHub PR URL to review')
    .option('--demo', 'Run in safe synthetic demonstration mode', true)
    .option('--no-demo', 'Disallow real execution (blocked in G00)')
    .action((prUrl, cmdOpts) => {
      if (cmdOpts.demo === false) {
        console.error("Error: Real execution mode is disabled in G00. Only --demo is supported.");
        process.exitCode = 1;
        return;
      }
      const parsed = parseGitHubPrUrl(prUrl || '');
      if (!parsed) {
        console.error("Error: Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number");
        process.exitCode = 1;
        return;
      }
      renderElement(<App initialScreen="inspection" initialPrUrl={parsed.url} isDemo={cmdOpts.demo} />);
    });

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
