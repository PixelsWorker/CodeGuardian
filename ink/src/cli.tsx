#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './App.js';
import { SYNTHETIC_REPORT } from './fixtures/fixtures.js';
import { formatReportMarkdown, formatReportJson } from './core/report-formatter.js';

const program = new Command();

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
      render(<App initialScreen="auth" isDemo={true} />);
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
  .action((prUrl, options) => {
    render(<App initialScreen="inspection" initialPrUrl={prUrl} isDemo={options.demo} />);
  });

program
  .command('report')
  .description('Export or inspect consolidated review findings')
  .argument('<run_id>', 'Run ID of the review session')
  .option('-f, --format <format>', 'Export format (markdown or json)', 'markdown')
  .action((runId, options) => {
    if (runId !== SYNTHETIC_REPORT.run_id && runId !== 'run-demo-42' && runId !== 'demo') {
      console.error(`Error: Run ID '${runId}' not found. Available demo run ID: '${SYNTHETIC_REPORT.run_id}'.`);
      process.exitCode = 1;
      return;
    }
    const fmt = options.format.toLowerCase();
    if (fmt === 'json') {
      console.log(formatReportJson(SYNTHETIC_REPORT));
    } else if (fmt === 'markdown' || fmt === 'md') {
      console.log(formatReportMarkdown(SYNTHETIC_REPORT));
    } else {
      console.error(`Error: Unsupported format '${options.format}'. Supported formats: markdown, json.`);
      process.exitCode = 1;
    }
  });

program
  .command('publish')
  .description('Inspect dry-run review publication preview and confirmation')
  .argument('<run_id>', 'Run ID of the review to publish')
  .option('--dry-run', 'Preview without making external writes', true)
  .action((runId) => {
    if (runId !== SYNTHETIC_REPORT.run_id && runId !== 'run-demo-42' && runId !== 'demo') {
      console.error(`Error: Run ID '${runId}' not found. Available demo run ID: '${SYNTHETIC_REPORT.run_id}'.`);
      process.exitCode = 1;
      return;
    }
    render(<App initialScreen="publish" isDemo={true} />);
  });

// Default action: launch Welcome screen TUI if no args
if (process.argv.length <= 2) {
  render(<App initialScreen="welcome" isDemo={true} />);
} else {
  program.parse(process.argv);
}
