import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppState, AppStateStatus } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { BiometricLockScreen } from './src/components/BiometricLockScreen';
import { useSettingsStore } from './src/stores/settingsStore';
import { useColorScheme } from 'react-native';

export default function App() {
  const { theme: themeSetting, isBiometricEnabled, isPinEnabled } = useSettingsStore();
  const colorScheme = useColorScheme();
  const theme = themeSetting === 'system' ? colorScheme : themeSetting;
  
  const [isLocked, setIsLocked] = useState(isBiometricEnabled || isPinEnabled);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Lock app when it goes to background if biometric or PIN is enabled
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled, isPinEnabled]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // If app is coming to foreground and was in background
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // Lock if biometric or PIN is enabled
      if (isBiometricEnabled || isPinEnabled) {
        setIsLocked(true);
      }
    }
    setAppState(nextAppState);
  };

  const handleAuthenticated = () => {
    setIsLocked(false);
  };

  if (isLocked && (isBiometricEnabled || isPinEnabled)) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <BiometricLockScreen onAuthenticated={handleAuthenticated} />
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
