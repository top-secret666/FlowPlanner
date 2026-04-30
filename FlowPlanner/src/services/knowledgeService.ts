import { useSettingsStore } from '../store/settingsStore';

export async function uploadImageToGitHub(
  base64: string,
  filename: string
): Promise<string> {
  const { token, owner, repo, branch } = useSettingsStore.getState();
  const path = `Interview-Prep/02_LEARNING/Knowledge-Base/_images/${filename}`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add image: ${filename}`,
      content: base64,
      branch,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.content.download_url as string;
}

export async function saveKnowledgeNote(
  topic: string,
  folder: string,
  level: string,
  tags: string,
  sourceUrl: string,
  status: string,
  body: string,
  images: { filename: string; githubUrl: string }[]
): Promise<void> {
  const { token, owner, repo, branch } = useSettingsStore.getState();

  const slug = topic.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-');
  const today = new Date().toISOString().split('T')[0];
  const folderEmojis: Record<string, string> = {
    Java_Backend: '☕',
    Spring: '🌱',
    Algorithms: '🧮',
    English: '🇬🇧',
    Other: '📝',
  };
  const emoji = folderEmojis[folder] ?? '📝';

  const imageLinks = images
    .map((img) => `![${img.filename}](${img.githubUrl})`)
    .join('\n');

  const content =
    `---\ntype: knowledge\ntopic: ${topic}\nfolder: ${folder}\n` +
    `tags: [${tags}]\nsource: ${sourceUrl}\nlevel: ${level}\n` +
    `status: ${status}\ncreated: ${today}\n---\n\n` +
    `# ${emoji} ${topic}\n\n${body}\n\n` +
    (images.length > 0 ? `## 🖼️ Материалы\n\n${imageLinks}\n\n` : '') +
    `---\n*Добавлено через FlowPlanner*\n`;

  const path = `Interview-Prep/02_LEARNING/Knowledge-Base/${folder}/${slug}.md`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Check for existing SHA
  let sha: string | undefined;
  const getRes = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const putBody: Record<string, string> = {
    message: `knowledge: ${topic}`,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) putBody.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`Save failed (${putRes.status}): ${text}`);
  }
}