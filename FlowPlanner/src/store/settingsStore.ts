export interface SettingsState {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folderPath: string;
  dailyPath: string;
  interviewDate: string;
  setToken: (v: string) => void;
  setOwner: (v: string) => void;
  setRepo: (v: string) => void;
  setBranch: (v: string) => void;
  setFolderPath: (v: string) => void;
  setDailyPath: (v: string) => void;
  setInterviewDate: (v: string) => void;
}

let state: SettingsState = {
  token: '',
  owner: 'top-secret666',
  repo: 'notes',
  branch: 'main',
  folderPath: 'Interview-Prep',
  dailyPath: 'DAILY/daily-notes',
  interviewDate: '2026-06-01',
  setToken: (v) => { state = { ...state, token: v }; },
  setOwner: (v) => { state = { ...state, owner: v }; },
  setRepo: (v) => { state = { ...state, repo: v }; },
  setBranch: (v) => { state = { ...state, branch: v }; },
  setFolderPath: (v) => { state = { ...state, folderPath: v }; },
  setDailyPath: (v) => { state = { ...state, dailyPath: v }; },
  setInterviewDate: (v) => { state = { ...state, interviewDate: v }; },
};

export const useSettingsStore = {
  getState: (): SettingsState => state,
  setState: (partial: Partial<SettingsState>): void => {
    state = { ...state, ...partial };
  },
};