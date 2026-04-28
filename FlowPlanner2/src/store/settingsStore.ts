import { create } from 'zustand';

interface SettingsState {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folderPath: string;
  setToken: (token: string) => void;
  setOwner: (owner: string) => void;
  setRepo: (repo: string) => void;
  setBranch: (branch: string) => void;
  setFolderPath: (folderPath: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  folderPath: 'notes',
  setToken: (token) => set({ token }),
  setOwner: (owner) => set({ owner }),
  setRepo: (repo) => set({ repo }),
  setBranch: (branch) => set({ branch }),
  setFolderPath: (folderPath) => set({ folderPath }),
}));