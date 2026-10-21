import { createHash } from 'node:crypto';
import type { ReviewReport } from '../types/contracts.js';

// G00 canonical JSON: recursively sorted object keys, array order preserved,
// UTF-8 JSON.stringify encoding, no whitespace; omit only top-level report_digest.
export function canonicalReportPayload(report: ReviewReport): string {
  const { report_digest: _digest, ...payload } = report;
  const sort = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sort);
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => [k, sort(v)]));
    }
    return value;
  };
  return JSON.stringify(sort(payload));
}

export function finalizeReport(report: ReviewReport): ReviewReport {
  return { ...report, report_digest: `sha256-${createHash('sha256').update(canonicalReportPayload(report), 'utf8').digest('hex')}` };
}
