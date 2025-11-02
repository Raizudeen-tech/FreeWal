import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  currency: string;
  theme: 'system' | 'light' | 'dark';
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  pinCode: string | null;
  useMaterial3: boolean; // Material 3 Expressive Theming toggle
}

interface SettingsState extends AppSettings {
  // Actions
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  enablePin: (pinCode: string) => void;
  disablePin: () => void;
  verifyPin: (pinCode: string) => boolean;
  enableBiometric: () => void;
  disableBiometric: () => void;
  setMaterial3: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      theme: 'system',
      isPinEnabled: false,
      isBiometricEnabled: false,
      pinCode: null,
      useMaterial3: false, // Material 3 disabled by default

      setCurrency: (currency: string) => set({ currency }),
      
      setTheme: (theme: 'system' | 'light' | 'dark') => set({ theme }),
      
      enablePin: (pinCode: string) =>
        set({ isPinEnabled: true, pinCode }),
      
      disablePin: () =>
        set({ isPinEnabled: false, pinCode: null }),
      
      verifyPin: (pinCode: string) => {
        const state = get();
        return state.isPinEnabled && state.pinCode === pinCode;
      },
      
      enableBiometric: () => set({ isBiometricEnabled: true }),
      
      disableBiometric: () => set({ isBiometricEnabled: false }),
      
      setMaterial3: (enabled: boolean) => set({ useMaterial3: enabled }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
