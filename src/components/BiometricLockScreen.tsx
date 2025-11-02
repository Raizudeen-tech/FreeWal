import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { getTheme } from '../constants/theme';
import { authenticateWithBiometrics, getBiometricTypeName } from '../utils/biometricAuth';

interface BiometricLockScreenProps {
  onAuthenticated: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onAuthenticated,
}) => {
  const { theme: themeMode, useMaterial3, isPinEnabled, verifyPin } = useSettingsStore();
  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = getTheme(resolvedTheme === 'dark' ? 'dark' : 'light', useMaterial3);
  
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    loadBiometricType();
    // Auto-trigger biometric authentication on mount
    handleBiometricAuth();
  }, []);

  const loadBiometricType = async () => {
    const type = await getBiometricTypeName();
    setBiometricType(type);
  };

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    const result = await authenticateWithBiometrics('Unlock FreeWal');
    setIsAuthenticating(false);

    if (result.success) {
      onAuthenticated();
    } else if (result.error) {
      Alert.alert('Authentication Failed', result.error);
    }
  };

  const handlePinFallback = () => {
    if (!isPinEnabled) {
      Alert.alert('PIN Not Set', 'Please use biometric authentication or restart the app.');
      return;
    }

    Alert.prompt(
      'Enter PIN',
      'Enter your 4-digit PIN to unlock',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: (pin?: string) => {
            if (pin && verifyPin(pin)) {
              onAuthenticated();
            } else {
              Alert.alert('Wrong PIN', 'Please try again');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* App Icon/Logo Area */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.iconText}>💰</Text>
        </View>

        {/* App Name */}
        <Text style={[styles.appName, { color: theme.colors.text }]}>FreeWal</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Expense Tracker
        </Text>

        {/* Lock Icon */}
        <View style={styles.lockContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* Instructions */}
        <Text style={[styles.instruction, { color: theme.colors.text }]}>
          Unlock with {biometricType}
        </Text>

        {/* Biometric Button */}
        <TouchableOpacity
          style={[
            styles.biometricButton,
            { backgroundColor: theme.colors.primary },
            theme.shadows.md,
            isAuthenticating && { opacity: 0.6 },
          ]}
          onPress={handleBiometricAuth}
          disabled={isAuthenticating}
        >
          <Text style={styles.biometricButtonText}>
            {isAuthenticating ? 'Authenticating...' : `Use ${biometricType}`}
          </Text>
        </TouchableOpacity>

        {/* PIN Fallback */}
        {isPinEnabled && (
          <TouchableOpacity
            style={styles.pinButton}
            onPress={handlePinFallback}
          >
            <Text style={[styles.pinButtonText, { color: theme.colors.primary }]}>
              Use PIN Instead
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  lockContainer: {
    marginBottom: 24,
  },
  lockIcon: {
    fontSize: 64,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  biometricButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pinButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pinButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
