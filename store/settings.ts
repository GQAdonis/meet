import { create } from 'zustand';

interface CustomSettings {
  pdsServer: string;
  liveKitServer: string;
  token: string;
  e2ee: boolean;
  passphrase: string;
}

interface SettingsState {
  settings: CustomSettings;
  setSettings: (settings: CustomSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    pdsServer: 'https://bsky.social',
    liveKitServer: '',
    token: '',
    e2ee: false,
    passphrase: '',
  },
  setSettings: (newSettings) => set({ settings: newSettings }),
})); 