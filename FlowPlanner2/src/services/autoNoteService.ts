import { useSettingsStore } from "../store/settingsStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyReport {
  date: string; // YYYY-MM-DD
  week: string; // YYYY-Www
  focus: string;
  score: number;
  content: string; // full markdown body (below frontmatter)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getNow(): string {
  const d = new Date();
  return `${getToday()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getISOWeek(date: Date): string {
  const jan4 = new Date(date.getFullYear(), 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((date.getTime() - start.getTime()) / (7 * 86400000)) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function extractSection(content: string, heading: string): string {
  const regex = new RegExp(`##\\s+${heading}[\\s\\S]*?(?=\\n##|$)`, "i");
  const match = content.match(regex);
  if (!match) return "";
  return match[0]
    .replace(/^##\s+.+\n/, "")
    .trim();
}

function extractFrontmatterField(raw: string, field: string): string {
  const m = raw.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function stripFrontmatter(raw: string): string {
  const m = raw.match(/^---[\s\S]*?---\n([\s\S]*)$/);
  return m ? m[1].trim() : raw.trim();
}

async function getFileFromGitHub(
  path: string,
  token: string,
  owner: string,
  repo: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return {
    content: atob(data.content.replace(/\n/g, "")),
    sha: data.sha,
  };
}

async function putFileToGitHub(
  path: string,
  content: string,
  sha: string | undefined,
  message: string,
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
}

// ─── Parse daily note from GitHub ────────────────────────────────────────────

async function fetchTodayDaily(
  token: string,
  owner: string,
  repo: string,
  folderPath: string
): Promise<DailyReport | null> {
  const today = getToday();
  const path = `${folderPath}/${today}-daily-report.md`;
  const file = await getFileFromGitHub(path, token, owner, repo);
  if (!file) return null;

  const raw = file.content;
  const focus = extractFrontmatterField(raw, "focus");
  const scoreStr = extractFrontmatterField(raw, "score");
  const score = scoreStr ? parseInt(scoreStr, 10) : 0;
  const week = extractFrontmatterField(raw, "week") || getISOWeek(new Date());
  const content = stripFrontmatter(raw);

  return { date: today, week, focus, score, content };
}

// ─── Auto-generate: Lesson note ──────────────────────────────────────────────

async function generateLessonNote(
  daily: DailyReport,
  token: string,
  owner: string,
  repo: string,
  branch: string,
  folderPath: string
): Promise<void> {
  const details = extractSection(daily.content, "🔬 Детали / примеры");
  const what = extractSection(daily.content, "☕ Что сделала");
  const result = extractSection(daily.content, "✅ Результат");

  const domain = daily.focus.includes("spring")
    ? "spring"
    : daily.focus.includes("sql") || daily.focus.includes("db")
    ? "sql"
    : daily.focus.includes("english")
    ? "english"
    : "java";

  const fileName = `${daily.date}-lesson-${daily.focus}.md`;
  const path = `${folderPath}/${fileName}`;

  const existing = await getFileFromGitHub(path, token, owner, repo);

  const noteContent =
    `---\n` +
    `type: lesson\n` +
    `date: ${daily.date}\n` +
    `week: ${daily.week}\n` +
    `domain: ${domain}\n` +
    `topic: ${daily.focus}\n` +
    `status: done\n` +
    `source: auto-generated from daily ${daily.date}\n` +
    `tags: [lesson, ${domain}, auto]\n` +
    `---\n\n` +
    `# 📖 Урок: ${daily.focus} — ${daily.date}\n\n` +
    `> Автоматически создано из Daily Report ${daily.date}\n\n` +
    `---\n\n` +
    `## 📝 Что изучала\n\n` +
    `${what || "_см. daily report_"}\n\n` +
    `---\n\n` +
    `## 🔬 Детали / примеры кода\n\n` +
    `${details || "_см. daily report_"}\n\n` +
    `---\n\n` +
    `## ✅ Результат\n\n` +
    `${result || "_см. daily report_"}\n\n` +
    `---\n\n` +
    `## 🔗 Источник\n\n` +
    `- [[DAILY/daily-notes/${daily.date}-daily-report|Daily Report ${daily.date}]]\n\n` +
    `_Создано автоматически: ${getNow()}_\n`;

  await putFileToGitHub(
    path,
    noteContent,
    existing?.sha,
    `lesson: auto ${daily.date} – ${daily.focus}`,
    token,
    owner,
    repo,
    branch
  );
}

// ─── Auto-generate: Weekly Review ────────────────────────────────────────────

async function generateWeeklyReview(
  daily: DailyReport,
  token: string,
  owner: string,
  repo: string,
  branch: string,
  folderPath: string
): Promise<void> {
  const path = `${folderPath}/weekly-review-${daily.week}.md`;
  const existing = await getFileFromGitHub(path, token, owner, repo);

  const nextStep = extractSection(daily.content, "🚧 Что осталось");
  const conclusion = extractSection(daily.content, "📝 Итог");

  let newContent: string;

  if (existing) {
    // Append today's entry to existing weekly review
    const entry =
      `\n---\n\n` +
      `### ${daily.date} — ${daily.focus} (score: ${daily.score})\n\n` +
      `${conclusion || nextStep || "_нет данных_"}\n`;
    newContent = existing.content.trimEnd() + entry;
  } else {
    newContent =
      `---\n` +
      `type: weekly-review\n` +
      `week: ${daily.week}\n` +
      `status: in-progress\n` +
      `created: ${daily.date}\n` +
      `last_updated: ${getNow()}\n` +
      `tags: [weekly-review, auto]\n` +
      `---\n\n` +
      `# 📊 Weekly Review — ${daily.week}\n\n` +
      `> Автоматически собирается из Daily Reports\n\n` +
      `---\n\n` +
      `## 📅 Дни недели\n\n` +
      `### ${daily.date} — ${daily.focus} (score: ${daily.score})\n\n` +
      `${conclusion || nextStep || "_нет данных_"}\n\n` +
      `---\n\n` +
      `## 🎯 Итог недели\n\n` +
      `_Заполнится автоматически по мере добавления daily reports_\n\n` +
      `---\n\n` +
      `## 🔗 Навигация\n\n` +
      `- [[06_SECOND_BRAIN/weekly-notes/Weekly-progress|Weekly Progress]]\n` +
      `- [[06_SECOND_BRAIN/Progress-tracker|Progress Tracker]]\n\n` +
      `_Обновлено: ${getNow()}_\n`;
  }

  await putFileToGitHub(
    path,
    newContent,
    existing?.sha,
    `weekly: auto update ${daily.week} – ${daily.date}`,
    token,
    owner,
    repo,
    branch
  );
}

// ─── Auto-generate: Project update note ──────────────────────────────────────

async function generateProjectUpdate(
  daily: DailyReport,
  token: string,
  owner: string,
  repo: string,
  branch: string,
  folderPath: string
): Promise<void> {
  const path = `${folderPath}/project-${daily.focus}-${daily.date}.md`;
  const existing = await getFileFromGitHub(path, token, owner, repo);
  if (existing) return; // don't overwrite if already exists

  const nextStep = extractSection(daily.content, "🚧 Что осталось");
  const result = extractSection(daily.content, "✅ Результат");

  const noteContent =
    `---\n` +
    `type: project\n` +
    `date: ${daily.date}\n` +
    `week: ${daily.week}\n` +
    `status: in-progress\n` +
    `topic: ${daily.focus}\n` +
    `source: auto-generated from daily ${daily.date}\n` +
    `tags: [project, auto]\n` +
    `---\n\n` +
    `# 🛠️ Проект: ${daily.focus} — ${daily.date}\n\n` +
    `> Автоматически создано из Daily Report ${daily.date}\n\n` +
    `---\n\n` +
    `## ✅ Что сделано\n\n` +
    `${result || "_см. daily report_"}\n\n` +
    `---\n\n` +
    `## 🚧 Следующие шаги\n\n` +
    `${nextStep || "_см. daily report_"}\n\n` +
    `---\n\n` +
    `## 🔗 Источник\n\n` +
    `- [[DAILY/daily-notes/${daily.date}-daily-report|Daily Report ${daily.date}]]\n\n` +
    `_Создано автоматически: ${getNow()}_\n`;

  await putFileToGitHub(
    path,
    noteContent,
    undefined,
    `project: auto ${daily.date} – ${daily.focus}`,
    token,
    owner,
    repo,
    branch
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Call this after saving a daily report.
 * Automatically generates lesson, weekly review, and project notes
 * based on today's daily report content.
 * Never throws — silently ignores errors.
 */
export async function autoGenerateFromDaily(): Promise<void> {
  try {
    const { token, owner, repo, branch, folderPath } =
      useSettingsStore.getState();

    const daily = await fetchTodayDaily(token, owner, repo, folderPath);
    if (!daily) return;

    await Promise.allSettled([
      generateLessonNote(daily, token, owner, repo, branch, folderPath),
      generateWeeklyReview(daily, token, owner, repo, branch, folderPath),
      generateProjectUpdate(daily, token, owner, repo, branch, folderPath),
    ]);
  } catch {
    // silently ignore
  }
}

/**
 * Same as autoGenerateFromDaily but accepts a pre-parsed daily report
 * so you can call it immediately after saving without re-fetching.
 */
export async function autoGenerateFromDailyData(data: {
  date: string;
  week: string;
  focus: string;
  score: number;
  content: string;
}): Promise<void> {
  try {
    const { token, owner, repo, branch, folderPath } =
      useSettingsStore.getState();

    await Promise.allSettled([
      generateLessonNote(data, token, owner, repo, branch, folderPath),
      generateWeeklyReview(data, token, owner, repo, branch, folderPath),
      generateProjectUpdate(data, token, owner, repo, branch, folderPath),
    ]);
  } catch {
    // silently ignore
  }
}