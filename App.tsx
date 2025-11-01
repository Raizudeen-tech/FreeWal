import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/stores/settingsStore';
import { useColorScheme } from 'react-native';

export default function App() {
  const { theme: themeSetting } = useSettingsStore();
  const colorScheme = useColorScheme();
  const theme = themeSetting === 'system' ? colorScheme : themeSetting;

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
