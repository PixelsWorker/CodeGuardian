/**
 * Evaluates host and port settings based on verified Google AI Studio platform signals
 * or local workstation defaults.
 *
 * Rules:
 * - Local default binds strictly to 127.0.0.1.
 * - NODE_ENV or PORT alone must NEVER trigger 0.0.0.0 binding.
 * - 0.0.0.0 is only authorized when verified platform signals (AIS_APPLET_ID, K_SERVICE, AIS_PREVIEW, GOOGLE_CLOUD_PROJECT)
 *   or explicit opt-in flags (VITE_HOST_ALL, PREVIEW_HOST_ALL) are present.
 */
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

  const trustedPreviewHosts = [
    'localhost',
    '127.0.0.1',
    'ais-dev-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
    'ais-pre-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
    '.asia-northeast1.run.app',
  ];

  if (env.AIS_APPLET_HOST) {
    trustedPreviewHosts.push(env.AIS_APPLET_HOST);
  }

  return {
    host,
    port,
    allowedHosts: trustedPreviewHosts,
  };
}
