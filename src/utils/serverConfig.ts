/**
 * Evaluates host and port settings based on verified Google AI Studio platform signals
 * or local workstation defaults.
 *
 * Rules:
 * - Local default binds strictly to 127.0.0.1.
 * - NODE_ENV or PORT alone must NEVER trigger 0.0.0.0 binding.
 * - 0.0.0.0 is only authorized when verified platform signals (AIS_APPLET_ID, K_SERVICE, AIS_PREVIEW, GOOGLE_CLOUD_PROJECT)
 *   or explicit opt-in flags (VITE_HOST_ALL, PREVIEW_HOST_ALL) are present.
 * - Vite trusted-host allowlist contains explicit approved hosts only; regional wildcard (.asia-northeast1.run.app) is removed.
 * - AIS_APPLET_HOST is strictly validated before inclusion: must be a valid bare hostname from the approved preview environment.
 */

export const DEFAULT_TRUSTED_HOSTS: readonly string[] = Object.freeze([
  'localhost',
  '127.0.0.1',
  'ais-dev-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
  'ais-pre-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
]);

/**
 * Validates dynamic preview hostnames (e.g. from AIS_APPLET_HOST).
 *
 * Requirements:
 * - Must be a valid bare hostname string (no leading/trailing whitespace).
 * - Reject URLs (protocols like http://, slashes /, ports :, query parameters ?, fragments #, auth @).
 * - Reject wildcards (*, leading dots ., trailing dots .).
 * - Reject malformed values (consecutive hyphens, invalid characters).
 * - Reject unexpected hosts (must strictly match approved Google AI Studio Cloud Run preview domain format).
 */
export function isValidPreviewHost(host: unknown): host is string {
  if (typeof host !== 'string') {
    return false;
  }

  const trimmed = host.trim();
  if (!trimmed || trimmed !== host) {
    return false;
  }

  // Reject URLs with protocol schemes, slashes, ports, query parameters, fragments, userinfo
  if (
    trimmed.includes('://') ||
    trimmed.includes('/') ||
    trimmed.includes(':') ||
    trimmed.includes('?') ||
    trimmed.includes('#') ||
    trimmed.includes('@')
  ) {
    return false;
  }

  // Reject wildcards and leading/trailing dots
  if (trimmed.includes('*') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return false;
  }

  // Must match approved preview environment hostname structure:
  // Starts with 'ais-', followed by alphanumeric labels, optional region domain, and strictly ending with '.run.app'
  const previewPattern = /^ais-[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.run\.app$/i;
  return previewPattern.test(trimmed);
}

export function resolveServerNetworkConfig(env: Record<string, string | undefined> = process.env) {
  // Explicit opt-in flags or verified Google AI Studio platform signals
  const isVerifiedPreviewOrOptIn = Boolean(
    env.AIS_APPLET_ID ||
    env.K_SERVICE ||
    env.AIS_PREVIEW === 'true' ||
    env.GOOGLE_CLOUD_PROJECT ||
    env.VITE_HOST_ALL === 'true' ||
    env.PREVIEW_HOST_ALL === 'true'
  );

  // Local development strictly defaults to 127.0.0.1.
  // NODE_ENV or PORT alone must NEVER trigger 0.0.0.0 binding.
  const host = isVerifiedPreviewOrOptIn ? '0.0.0.0' : '127.0.0.1';
  const port = env.PORT ? parseInt(env.PORT, 10) : 3000;

  const allowedHosts: string[] = [...DEFAULT_TRUSTED_HOSTS];

  if (env.AIS_APPLET_HOST && isValidPreviewHost(env.AIS_APPLET_HOST)) {
    const validatedHost = env.AIS_APPLET_HOST.toLowerCase();
    if (!allowedHosts.includes(validatedHost)) {
      allowedHosts.push(validatedHost);
    }
  }

  return {
    host,
    port,
    allowedHosts,
  };
}
