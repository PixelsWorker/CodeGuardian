export interface UrlValidationResult {
  valid: boolean;
  owner?: string;
  repo?: string;
  number?: number;
  error?: string;
}

/**
 * Validates a GitHub pull request URL according to RFC 3986 and GitHub naming rules:
 * - Must use HTTPS protocol (no insecure HTTP)
 * - Hostname must strictly equal 'github.com' (no evil.com/github.com or subdomains)
 * - Must NOT contain embedded username or password credentials
 * - Pathname must match /:owner/:repo/pull/:number where:
 *   - owner and repo contain only alphanumeric characters, hyphens, underscores, or periods
 *   - number is a positive integer (no leading zeros or negative)
 */
export function validateGitHubPullRequestUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Empty URL. Please enter a target pull request URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Malformed URL format. Expected RFC-compliant URL (e.g. https://github.com/owner/repo/pull/42).",
    };
  }

  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Insecure or unsupported protocol '${parsed.protocol}'. CodeGuardian requires HTTPS.`,
    };
  }

  if (parsed.hostname !== "github.com") {
    return {
      valid: false,
      error: `Unsupported host '${parsed.hostname}'. Only official GitHub (github.com) URLs are supported.`,
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: "URLs containing embedded user credentials (username/password) are forbidden.",
    };
  }

  // GitHub repository and username rules:
  // - alphanumeric, hyphens, periods, underscores
  // - positive number for PR
  const match = parsed.pathname.match(
    /^\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/([1-9]\d*)\/?$/
  );

  if (!match) {
    return {
      valid: false,
      error: "Malformed PR path. Expected format: https://github.com/:owner/:repo/pull/:number",
    };
  }

  const owner = match[1];
  const repo = match[2];
  const number = parseInt(match[3], 10);

  // Additional sanity check: prevent invalid tokens like '.' or '..'
  if (owner === "." || owner === ".." || repo === "." || repo === "..") {
    return {
      valid: false,
      error: "Invalid repository or organization name identifiers.",
    };
  }

  return {
    valid: true,
    owner,
    repo,
    number,
  };
}
