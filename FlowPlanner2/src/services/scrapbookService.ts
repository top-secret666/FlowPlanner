import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../store/settingsStore';

export type ScrapbookPage = {
  id: number;
  filename: string;
  githubPath: string;
  notePath?: string;
  imageUrl?: string;
  title?: string;
  tags?: string[];
  linkedTopic?: string;
  knowledgeFolder?: string;
  createdAt: string;
};

const SCRAPBOOK_PAGES_KEY = 'scrapbook_pages';

export async function uploadScrapbookImageToGitHub(
  base64: string,
  filename: string
): Promise<{ path: string; imageUrl: string }> {
  const { token, owner, repo, branch } = useSettingsStore.getState();
  const path = `Interview-Prep/02_LEARNING/Knowledge-Base/_scrapbook/${filename}`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add scrapbook page: ${filename}`,
      content: base64,
      branch,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  return { path, imageUrl };
}

export async function createScrapbookNoteOnGitHub(
  filename: string,
  imagePath: string,
  imageUrl: string,
  title?: string,
  tags: string[] = [],
  linkedTopic?: string,
  knowledgeFolder = 'Other'
): Promise<{ notePath: string }> {
  const { token, owner, repo, branch, folderPath } = useSettingsStore.getState();
  const noteFilename = filename.replace(/\.png$/i, '.md');
  const notePath = `${folderPath}/scrapbook/${noteFilename}`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${notePath}`;
  const created = new Date().toISOString().split('T')[0];
  const safeTitle = title?.trim() || noteFilename.replace(/\.md$/i, '');
  const tagsLine = tags.length > 0 ? tags.join(', ') : 'scrapbook';

  const content =
    `---\n` +
    `type: scrapbook\n` +
    `title: ${safeTitle}\n` +
    `tags: [${tagsLine}]\n` +
    `knowledge_folder: ${knowledgeFolder}\n` +
    `linked_topic: ${linkedTopic?.trim() || ''}\n` +
    `created: ${created}\n` +
    `image_path: ${imagePath}\n` +
    `---\n\n` +
    `# 🎨 ${safeTitle}\n\n` +
    `![${filename}](${imageUrl})\n\n` +
    `---\n` +
    `*Создано в FlowPlanner Scrapbook*\n`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add scrapbook note: ${noteFilename}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Note save failed (${response.status}): ${text}`);
  }

  return { notePath };
}

export async function getSavedScrapbookPages(): Promise<ScrapbookPage[]> {
  const raw = await AsyncStorage.getItem(SCRAPBOOK_PAGES_KEY);
  const parsed = JSON.parse(raw || '[]') as ScrapbookPage[];
  return parsed;
}

export async function saveScrapbookPageMetadata(
  page: ScrapbookPage
): Promise<ScrapbookPage[]> {
  const existing = await getSavedScrapbookPages();
  const updated = [...existing, page];
  await AsyncStorage.setItem(SCRAPBOOK_PAGES_KEY, JSON.stringify(updated));
  return updated;
}
