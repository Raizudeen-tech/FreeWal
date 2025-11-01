import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';
import { CURRENCIES } from '../constants/data';
import { exportToCSV } from '../utils/export';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../data/database/DatabaseService';

import { ThemeToggle } from '../components/ThemeToggle';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    currency,
    theme: themeMode,
    setCurrency,
    setTheme,
    isPinEnabled,
    isBiometricEnabled,
    enablePin,
    disablePin,
    enableBiometric,
    disableBiometric,
  } = useSettingsStore();

  const { expenses } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();

  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleExport = async () => {
    try {
      await exportToCSV(expenses, categories, accounts);
      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleTogglePin = () => {
    if (isPinEnabled) {
      Alert.alert(
        'Disable PIN',
        'Are you sure you want to disable PIN protection?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', onPress: disablePin },
        ]
      );
    } else {
      Alert.prompt(
        'Enable PIN',
        'Enter a 4-digit PIN',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set PIN',
            onPress: (pin?: string) => {
              if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
                enablePin(pin);
              } else {
                Alert.alert('Error', 'Please enter a valid 4-digit PIN');
              }
            },
          },
        ],
        'secure-text'
      );
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will permanently delete all accounts, categories, and transactions, and reset settings. This action cannot be undone. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Wipe database: drops and recreates tables
              await DatabaseService.resetDatabase();

              // Clear persisted settings
              await AsyncStorage.removeItem('app-settings');

              // Also reset runtime settings to defaults immediately
              disableBiometric();
              disablePin();
              // Toggle until we reach light (since toggle cycles)
              if (themeMode !== 'light') {
                // Ensure we set to light deterministically
                // use explicit setter when available
                useSettingsStore.getState().setTheme('system');
              }

              // Refresh in-memory stores
              await Promise.all([
                useCategoryStore.getState().fetchCategories(),
                useAccountStore.getState().fetchAccounts(),
                useExpenseStore.getState().fetchExpenses(),
              ]);

              Alert.alert('Reset complete', 'All app data has been removed.');
            } catch (e) {
              Alert.alert('Reset failed', 'Something went wrong while resetting the app.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      {/* Accounts Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accounts</Text>
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
          onPress={() => navigation.navigate('Accounts')}
        >
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Manage Accounts</Text>
          <Text style={[styles.settingValue, { color: theme.colors.primary }]}>{accounts.length} total</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Appearance
        </Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Theme
          </Text>
          <ThemeToggle
            value={themeMode}
            onValueChange={setTheme}
          />
        </View>
      </View>

      {/* Currency Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Currency
        </Text>
        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
          onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
        >
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Default Currency
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.primary }]}>
            {currency}
          </Text>
        </TouchableOpacity>
        {showCurrencyPicker && (
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  currency === curr.code && { backgroundColor: theme.colors.primary + '20' },
                ]}
                onPress={() => {
                  setCurrency(curr.code);
                  setShowCurrencyPicker(false);
                }}
              >
                <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
                  {curr.code}
                </Text>
                <Text style={[styles.currencyName, { color: theme.colors.textSecondary }]}>
                  {curr.name} ({curr.symbol})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Security
        </Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            PIN Lock
          </Text>
          <Switch
            value={isPinEnabled}
            onValueChange={handleTogglePin}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Biometric Lock
          </Text>
          <Switch
            value={isBiometricEnabled}
            onValueChange={(value) => value ? enableBiometric() : disableBiometric()}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Data Management
        </Text>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.primary }, theme.shadows.sm]}
          onPress={handleExport}
        >
          <Text style={styles.actionText}>Export to CSV</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Version
          </Text>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            1.0.0
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Danger Zone
        </Text>
        <View style={[styles.resetCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
          <View style={styles.resetContent}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Reset Application
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              Deletes all data and resets settings.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleResetApp}
            style={[styles.resetButton, { backgroundColor: theme.colors.error }]}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resetContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currencyOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    marginTop: 2,
  },
  actionCard: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
