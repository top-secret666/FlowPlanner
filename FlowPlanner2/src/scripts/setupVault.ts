import { useSettingsStore } from '../store/settingsStore';

interface VaultFile {
  path: string;
  content: string;
}

function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

async function getFileSha(
  path: string,
  token: string,
  owner: string,
  repo: string
): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 404) return undefined;
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.sha as string;
}

async function pushFile(
  file: VaultFile,
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<void> {
  const sha = await getFileSha(file.path, token, owner, repo);
  const body: Record<string, string> = {
    message: `vault: update ${file.path.split('/').pop()}`,
    content: toBase64(file.content),
    branch,
  };
  if (sha) body.sha = sha;

  const cleanPath = file.path.replace(/^\/+/, '');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  console.log('Pushing file to:', url);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log('Response status:', response.status, responseText);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`GitHub API error ${response.status}: ${responseText}`);
  }
}

const VAULT_FILES: VaultFile[] = [
  {
    path: 'Interview-Prep/06_SECOND_BRAIN/Today-panel.md',
    content: `---
type: dashboard
tags: [dashboard, today]
---

# 🗓️ Today Panel
> Обновляется автоматически из твоих заметок

## 📌 Что сделала сегодня

\`\`\`dataview
TABLE focus as "Фокус", score as "Score", report_date as "Дата"
FROM "DAILY/daily-notes"
WHERE type = "daily-report" AND report_date = date(today)
SORT file.mtime DESC
\`\`\`

## 📖 Уроки сегодня

\`\`\`dataview
LIST file.name
FROM "Interview-Prep/02_LEARNING"
WHERE date(file.mtime) = date(today)
SORT file.mtime DESC
\`\`\`

## ✅ Все заметки сегодня

\`\`\`dataview
TABLE file.name as "Заметка", type as "Тип"
FROM "DAILY/daily-notes" OR "notes"
WHERE date(file.mtime) = date(today)
SORT file.mtime DESC
\`\`\`
`,
  },
  {
    path: 'Interview-Prep/06_SECOND_BRAIN/weekly-notes/Weekly-focus.md',
    content: `---
type: dashboard
tags: [dashboard, weekly]
---

# 📊 Weekly Focus

## 🎯 Daily Reports этой недели

\`\`\`dataview
TABLE report_date as "День", focus as "Фокус", score as "Score"
FROM "DAILY/daily-notes"
WHERE type = "daily-report" AND date(report_date) >= date(today) - dur(7 days)
SORT report_date DESC
\`\`\`

## 📖 Уроки этой недели

\`\`\`dataview
TABLE file.name as "Тема", domain as "Домен"
FROM "Interview-Prep/02_LEARNING"
WHERE date(file.mtime) >= date(today) - dur(7 days)
SORT file.mtime DESC
\`\`\`

## 🏆 Счёт недели

\`\`\`dataview
TABLE WITHOUT ID sum(rows.score) as "Сумма очков", length(rows) as "Дней"
FROM "DAILY/daily-notes"
WHERE type = "daily-report" AND date(report_date) >= date(today) - dur(7 days)
\`\`\`
`,
  },
  {
    path: 'Interview-Prep/06_SECOND_BRAIN/weekly-notes/Weekly-progress.md',
    content: `---
type: dashboard
tags: [dashboard, weekly-progress]
---

# 📅 Weekly Progress

\`\`\`dataviewjs
const notes = dv.pages('"DAILY/daily-notes"')
  .where(p => p.type === "daily-report")
  .sort(p => p.report_date, "desc");

const byWeek = {};
for (const note of notes) {
  const d = new Date(note.report_date);
  if (!isNaN(d)) {
    const week = \`\${d.getFullYear()}-W\${String(Math.ceil((((d - new Date(d.getFullYear(),0,1))/86400000)+1)/7)).padStart(2,'0')}\`;
    if (!byWeek[week]) byWeek[week] = [];
    byWeek[week].push(note);
  }
}
for (const [week, items] of Object.entries(byWeek).sort().reverse()) {
  dv.header(3, \`📅 \${week} — \${items.length} дней\`);
  dv.table(["День","Фокус","Score"],
    items.map(n => [n.report_date, n.focus ?? "—", n.score ?? 0]));
}
\`\`\`
`,
  },
  {
    path: 'Interview-Prep/01_DASHBOARD/Progress-dashboard.md',
    content: `---
type: dashboard
tags: [dashboard, progress]
---

# 📈 Progress Dashboard

## 🔥 Активность (последние 14 дней)

\`\`\`dataview
TABLE report_date as "Дата", focus as "Фокус", score as "Score"
FROM "DAILY/daily-notes"
WHERE type = "daily-report" AND date(report_date) >= date(today) - dur(14 days)
SORT report_date DESC
\`\`\`

## 📚 Java — изученные темы

\`\`\`dataview
TABLE file.name as "Тема", file.mtime as "Дата"
FROM "Interview-Prep/02_LEARNING/Java_Backend"
SORT file.mtime DESC
\`\`\`

## 🌱 Spring — изученные темы

\`\`\`dataview
TABLE file.name as "Тема", file.mtime as "Дата"
FROM "Interview-Prep/02_LEARNING/Spring"
SORT file.mtime DESC
\`\`\`

## 🗂️ Активные проекты

\`\`\`dataview
TABLE file.name as "Проект", status as "Статус"
FROM "Interview-Prep/04_PROJECTS/active-projects"
SORT file.mtime DESC
\`\`\`

## 📊 Общий счёт

\`\`\`dataview
TABLE WITHOUT ID
  sum(rows.score) as "Общий Score",
  length(rows) as "Всего Daily Reports"
FROM "DAILY/daily-notes"
WHERE type = "daily-report"
\`\`\`
`,
  },
  {
    path: 'Interview-Prep/07_AI_ADMIN/Auto-progress.md',
    content: `---
type: auto-progress
tags: [auto, progress, admin]
---

# 🤖 Auto Progress Log

> Автоматически обновляется FlowPlanner после каждого сохранения заметки

## 📋 Последние записи

\`\`\`dataview
TABLE file.name as "Заметка", type as "Тип", file.mtime as "Время"
FROM "DAILY/daily-notes" OR "notes"
SORT file.mtime DESC
LIMIT 20
\`\`\`
`,
  },
];

export async function setupVault(): Promise<{ success: number; failed: { path: string; error: string }[] }> {
  const { token, owner, repo, branch } = useSettingsStore.getState();

  if (!token || !owner || !repo) {
    throw new Error('Please fill in GitHub Token, Owner, and Repository in Settings first');
  }

  const failedFiles: { path: string; error: string }[] = [];
  let successCount = 0;

  for (const file of VAULT_FILES) {
    try {
      await pushFile(file, token, owner, repo, branch);
      successCount++;
    } catch (err: any) {
      failedFiles.push({ path: file.path, error: err?.message ?? 'unknown error' });
    }
  }

  return { success: successCount, failed: failedFiles };
}