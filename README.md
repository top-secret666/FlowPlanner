<div align="center">

# FlowPlanner

**STUDY Mobile app planner for notes, learning & creative scrapbooks**

Capture daily notes · structure knowledge · sync to Obsidian via GitHub  
Dark-mode Expo app built for internship & interview prep.

[![Expo](https://img.shields.io/badge/Expo-55-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NativeWind](https://img.shields.io/badge/NativeWind-4-06B6D4?style=flat-square)](https://www.nativewind.dev)

[Features](#-features) · [Screenshots](#-screenshots) · [Quick start](#-quick-start) · [Obsidian sync](#-obsidian--github-sync)

<img width="1000" height="576" alt="120a2646c7bcbee09943a1a3501e43ac" src="https://github.com/user-attachments/assets/0ed2463e-8e11-468e-be40-78fa8c022a6d" />

</div>

---

FlowPlanner is a portrait mobile app for developers who live in Obsidian. Write notes on the go, organize study topics (Java, Spring, Algorithms…), design scrapbook pages, and push Markdown straight into your vault on GitHub.

App code: `FlowPlanner/` (also `FlowPlanner2/`) · Repo: [github.com/top-secret666/FlowPlanner](https://github.com/top-secret666/FlowPlanner)

## Features

- **Notes** — daily report, weekly review, and lesson templates; save into topic folders
- **Knowledge base** — rich editor with Theory / Notes / Questions / Links, difficulty levels, tags, images
- **Scrapbook** — visual canvas with stickers, shapes, text, frames, brush, templates & export
- **Obsidian sync** — commit Markdown to a GitHub repo (token, owner, branch, folder path)
- **Dark UI** — teal accents, bottom tabs: Note · Knowledge · Scrap · Settings
- **Local persistence** — AsyncStorage / Secure Store · SQLite · Zustand stores

## Screenshots

<table>
  <tr>
    <td width="25%" align="center" valign="top">
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/316afb0f-07ad-4eea-8039-a68bc5cedf1f" />
      <sub>New Note — templates & folders</sub>
    </td>
    <td width="25%" align="center" valign="top">
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/f9a8d9e6-05ea-4ad3-97b0-707784d61c7e" />
      <sub>Knowledge editor — theory & tags</sub>
    </td>
    <td width="25%" align="center" valign="top">
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/601ec841-cbb3-4bd3-9419-7d05dfc6fa26" />
      <sub>Scrapbook — stickers & canvas</sub>
    </td>
    <td width="25%" align="center" valign="top">
<img width="576" height="1280" alt="image" src="https://github.com/user-attachments/assets/4fc4b414-9eec-4c17-9c17-4ca594de0b86" />
      <sub>Settings — GitHub / Obsidian sync</sub>
    </td>
  </tr>
</table>

## Quick start

Requires **Node.js 18+** and the [Expo Go](https://expo.dev/go) app (or an emulator).

```bash
git clone https://github.com/top-secret666/FlowPlanner.git
cd FlowPlanner/FlowPlanner

npm install
npx expo start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS).

| Script | What it does |
| --- | --- |
| `npm start` / `npx expo start` | Dev server |
| `npm run android` | Open Android |
| `npm run ios` | Open iOS simulator |
| `npm run web` | Run in browser |

EAS build profiles live in `eas.json` (APK preview / AAB production).

## Obsidian + GitHub sync

In **Settings**, set:

| Field | Example |
| --- | --- |
| Token | GitHub PAT with `repo` scope |
| Owner | `top-secret666` |
| Repository | `notes` |
| Branch | `main` |
| Folder path | `Interview-Prep` |

**Save to Obsidian** creates a dated `.md` file under the chosen folder (or topic paths like `Interview-Prep/02_LEARNING/Java_Backend`).

Keep the token out of git — store it only in the app (Secure Store).

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Expo 55 · React Native 0.83 · React 19 |
| Navigation | Expo Router · bottom tabs |
| Styling | NativeWind 4 · Tailwind |
| State | Zustand |
| Storage | AsyncStorage · expo-secure-store · expo-sqlite |
| Media | expo-image-picker · CE.SDK scrapbook canvas |
| Sync | GitHub Contents API (Markdown → Obsidian vault) |

## Project layout

```text
FlowPlanner/
├── app/(tabs)/          # Note, Knowledge, Scrapbook, Settings…
├── src/
│   ├── screens/         # Today, Tasks, Journal, Scrapbook, Settings
│   ├── components/
│   ├── services/        # obsidian, github, notes, scrapbook
│   ├── store/           # Zustand
│   └── theme/
├── assets/
├── app.json
└── package.json
```

---

<div align="center">

Built with Expo · React Native · NativeWind  
[github.com/top-secret666/FlowPlanner](https://github.com/top-secret666/FlowPlanner)

</div>
