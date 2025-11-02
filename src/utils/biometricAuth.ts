import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

/**
 * Check if the device has biometric hardware
 */
export async function hasBiometricHardware(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    return hasHardware;
  } catch (error) {
    console.error('Error checking biometric hardware:', error);
    return false;
  }
}

/**
 * Check if biometrics are enrolled (fingerprint/face registered)
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  try {
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
}

/**
 * Get supported authentication types
 */
export async function getSupportedAuthTypes(): Promise<number[]> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  } catch (error) {
    console.error('Error getting supported auth types:', error);
    return [];
  }
}

/**
 * Get a user-friendly name for the biometric type
 */
export async function getBiometricTypeName(): Promise<string> {
  const types = await getSupportedAuthTypes();
  
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  
  return 'Biometric';
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if hardware is available
    const hasHardware = await hasBiometricHardware();
    if (!hasHardware) {
      return {
        success: false,
        error: 'Biometric hardware not available on this device',
      };
    }

    // Check if biometrics are enrolled
    const isEnrolled = await isBiometricEnrolled();
    if (!isEnrolled) {
      return {
        success: false,
        error: 'No biometrics enrolled. Please set up fingerprint or face recognition in your device settings.',
      };
    }

    // Get biometric type name
    const biometricType = await getBiometricTypeName();

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || `Authenticate with ${biometricType}`,
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during authentication',
    };
  }
}

/**
 * Check if biometric authentication can be used
 */
export async function canUseBiometrics(): Promise<{
  available: boolean;
  reason?: string;
}> {
  const hasHardware = await hasBiometricHardware();
  if (!hasHardware) {
    return {
      available: false,
      reason: 'This device does not support biometric authentication',
    };
  }

  const isEnrolled = await isBiometricEnrolled();
  if (!isEnrolled) {
    return {
      available: false,
      reason: 'No biometrics enrolled. Please set up fingerprint or face recognition in device settings.',
    };
  }

  return { available: true };
}
