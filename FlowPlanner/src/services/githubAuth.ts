export function normalizeGitHubToken(token: string): string {
  return token.trim().replace(/^(token|bearer)\s+/i, '');
}

export function getGitHubAuthHeader(token: string): string {
  const normalizedToken = normalizeGitHubToken(token);

  if (!normalizedToken || normalizedToken === 'github_pat_your_token_here') {
    throw new Error('GitHub token is missing. Add a real Personal Access Token in Settings.');
  }

  return `Bearer ${normalizedToken}`;
}