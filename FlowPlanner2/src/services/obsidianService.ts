import { useSettingsStore } from '../store/settingsStore';

function sanitizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFilename(title: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sanitized = sanitizeTitle(title) || 'untitled';
  return `${yyyy}-${mm}-${dd}-${HH}${min}-${sanitized}.md`;
}

function encodeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  // btoa requires latin1; encode utf-8 chars first
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

export async function syncNote(title: string, body: string): Promise<void> {
  const { token, owner, repo, branch, folderPath } = useSettingsStore.getState();

  const filename = generateFilename(title);
  const markdownContent = `# ${title}\n\n${body}`;
  const base64Content = encodeBase64(markdownContent);

  const path = folderPath ? `${folderPath}/${filename}` : filename;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      message: `Add note: ${title}`,
      content: base64Content,
      branch,
    }),
  });

  if (response.status === 200 || response.status === 201) {
    return;
  }

  let detail = '';
  try {
    const json = await response.json();
    detail = json?.message ? `: ${json.message}` : '';
  } catch {
    // ignore parse errors
  }

  throw new Error(`GitHub API error (HTTP ${response.status})${detail}`);
}

export const obsidianService = { syncNote };