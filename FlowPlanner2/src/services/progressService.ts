import { useSettingsStore } from "../store/settingsStore";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getNow(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function getWeek(): string {
  const d = new Date();
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = d.getTime() - startOfWeek1.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function getFileFromGitHub(
  path: string,
  token: string,
  owner: string,
  repo: string
): Promise<{ content: string; sha: string } | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const content = atob(data.content.replace(/\n/g, ""));
  return { content, sha: data.sha };
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
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

// ─── Export 1: updateProgressLog ────────────────────────────────────────────

export async function updateProgressLog(
  noteTitle: string,
  templateId: string,
  score?: number
): Promise<void> {
  try {
    const { token, owner, repo, branch, folderPath } =
      useSettingsStore.getState();
    const path = `${folderPath}/progress-log.md`;
    const newEntry = `- ✅ ${getNow()} | **${noteTitle}** | type: ${templateId} | score: ${score ?? 0} | 🎉 Молодец!`;

    const existing = await getFileFromGitHub(path, token, owner, repo);

    let newContent: string;
    let sha: string | undefined;

    if (existing) {
      newContent = existing.content.trimEnd() + "\n" + newEntry + "\n";
      sha = existing.sha;
    } else {
      newContent =
        `# 📈 Progress Log\n\nАвтоматический журнал твоего прогресса.\n\n` +
        newEntry +
        "\n";
    }

    await putFileToGitHub(
      path,
      newContent,
      sha,
      `progress: ${getToday()} – ${noteTitle}`,
      token,
      owner,
      repo,
      branch
    );
  } catch {
    // silently ignore
  }
}

// ─── Export 2: updateDashboard ───────────────────────────────────────────────

export async function updateDashboard(
  noteTitle: string,
  templateId: string,
  score?: number
): Promise<void> {
  try {
    const { token, owner, repo, branch, folderPath } =
      useSettingsStore.getState();
    const path = `${folderPath}/dashboard.md`;

    const existing = await getFileFromGitHub(path, token, owner, repo);

    let total_notes = 1;
    let daily_reports = 0;
    let lessons = 0;
    let weekly_reviews = 0;
    let current_streak = 1;
    let sha: string | undefined;

    if (existing) {
      try {
        const c = existing.content;
        sha = existing.sha;

        const parseNum = (key: string): number => {
          const m = c.match(new RegExp(`^${key}:: (\\d+)`, "m"));
          return m ? parseInt(m[1], 10) : 0;
        };

        total_notes = parseNum("total_notes") + 1;
        daily_reports =
          parseNum("daily_reports") + (templateId === "daily" ? 1 : 0);
        lessons = parseNum("lessons") + (templateId === "lesson" ? 1 : 0);
        weekly_reviews =
          parseNum("weekly_reviews") + (templateId === "weekly" ? 1 : 0);
        current_streak = parseNum("current_streak") + 1;
      } catch {
        total_notes = 1;
        daily_reports = templateId === "daily" ? 1 : 0;
        lessons = templateId === "lesson" ? 1 : 0;
        weekly_reviews = templateId === "weekly" ? 1 : 0;
        current_streak = 1;
      }
    } else {
      daily_reports = templateId === "daily" ? 1 : 0;
      lessons = templateId === "lesson" ? 1 : 0;
      weekly_reviews = templateId === "weekly" ? 1 : 0;
    }

    const achievements: Record<number, string> = {
      1: "🌱 Первая заметка! Начало положено!",
      5: "🔥 Уже 5 заметок! Так держать!",
      10: "⭐ 10 заметок! Ты в ударе!",
      25: "🚀 25 заметок! Настоящий прогресс!",
      50: "🏆 50 заметок! Ты невероятна!",
    };
    const achievementMessage = achievements[total_notes] ?? "";

    const now = getNow();

    const check = (cond: boolean, yes: string, no: string) =>
      cond ? yes : no;

    const newContent =
      `---\n` +
      `total_notes:: ${total_notes}\n` +
      `daily_reports:: ${daily_reports}\n` +
      `lessons:: ${lessons}\n` +
      `weekly_reviews:: ${weekly_reviews}\n` +
      `last_updated:: ${now}\n` +
      `current_streak:: ${current_streak}\n` +
      `---\n` +
      `\n` +
      `# 🎯 FlowPlanner Dashboard\n` +
      `\n` +
      `> Последнее обновление: **${now}**\n` +
      (achievementMessage ? `${achievementMessage}\n` : ``) +
      `\n` +
      `---\n` +
      `\n` +
      `## 📊 Статистика\n` +
      `\n` +
      `| Метрика | Значение |\n` +
      `|---|---|\n` +
      `| 📝 Всего заметок | ${total_notes} |\n` +
      `| ☕ Daily Reports | ${daily_reports} |\n` +
      `| 📖 Уроков | ${lessons} |\n` +
      `| 📊 Weekly Reviews | ${weekly_reviews} |\n` +
      `| 🔥 Серия дней | ${current_streak} |\n` +
      `\n` +
      `---\n` +
      `\n` +
      `## 🕐 Последняя активность\n` +
      `\n` +
      `**${now}** — ${noteTitle} _(тип: ${templateId}${score !== undefined ? `, score: ${score}` : ''})_\n` +
      `\n` +
      `---\n` +
      `\n` +
      `## 🏆 Достижения\n` +
      `\n` +
      `- [x] 🌱 Первая заметка создана\n` +
      check(
        total_notes >= 5,
        `- [x] 🔥 5 заметок написано\n`,
        `- [ ] 🔥 5 заметок написано (осталось: ${5 - total_notes})\n`
      ) +
      check(
        total_notes >= 10,
        `- [x] ⭐ 10 заметок\n`,
        `- [ ] ⭐ 10 заметок (осталось: ${10 - total_notes})\n`
      ) +
      check(
        total_notes >= 25,
        `- [x] 🚀 25 заметок\n`,
        `- [ ] 🚀 25 заметок (осталось: ${25 - total_notes})\n`
      ) +
      check(
        total_notes >= 50,
        `- [x] 🏆 50 заметок\n`,
        `- [ ] 🏆 50 заметок (осталось: ${50 - total_notes})\n`
      ) +
      check(
        daily_reports >= 7,
        `- [x] 📅 Неделя Daily Reports подряд\n`,
        `- [ ] 📅 Неделя Daily Reports (осталось: ${7 - daily_reports})\n`
      ) +
      check(
        lessons >= 10,
        `- [x] 🎓 10 уроков изучено\n`,
        `- [ ] 🎓 10 уроков (осталось: ${10 - lessons})\n`
      ) +
      `\n` +
      `---\n` +
      `\n` +
      `_Обновляется автоматически через FlowPlanner_\n`;

    await putFileToGitHub(
      path,
      newContent,
      sha,
      `dashboard: update ${getToday()}`,
      token,
      owner,
      repo,
      branch
    );
  } catch {
    // silently ignore
  }
}

// ─── Export 3: trackNote ─────────────────────────────────────────────────────

export async function trackNote(
  noteTitle: string,
  templateId: string,
  score?: number
): Promise<void> {
  try {
    await Promise.all([
      updateProgressLog(noteTitle, templateId, score),
      updateDashboard(noteTitle, templateId, score),
    ]);
  } catch {
    // silently ignore
  }
}