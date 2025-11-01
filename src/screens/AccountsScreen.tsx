import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';
import { lightTheme, darkTheme } from '../constants/theme';
import { getCurrencySymbol } from '../utils/export';

export const AccountsScreen: React.FC = () => {
  const { accounts, fetchAccounts, addAccount, deleteAccount, loading } = useAccountStore();
  const { currency, theme: themeMode } = useSettingsStore();

  const systemScheme = useColorScheme() || 'light';
  const resolved = themeMode === 'system' ? systemScheme : themeMode;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    // Make sure accounts are loaded
    fetchAccounts().catch(() => {});
  }, [fetchAccounts]);

  const currencySymbol = getCurrencySymbol(currency);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter an account name');
      return;
    }
    const starting = parseFloat(balance || '0');
    if (isNaN(starting) || starting < 0) {
      Alert.alert('Validation', 'Please enter a valid starting balance');
      return;
    }
    try {
      await addAccount({ name: name.trim(), balance: starting, currency });
      setName('');
      setBalance('');
    } catch (e) {
      Alert.alert('Error', 'Failed to add account');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete account', 'Are you sure you want to delete this account? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount(id);
          } catch (e) {
            Alert.alert('Error', 'Failed to delete account');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Accounts</Text>
      </View>

      {/* Add form */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Add Account</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Main Account"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Starting Balance</Text>
          <View style={[styles.amountRow, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.currency, { color: theme.colors.primary }]}>{currencySymbol}</Text>
            <TextInput
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.amountInput, { color: theme.colors.text }]}
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, loading && { opacity: 0.6 }]}
          onPress={handleAdd}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Adding…' : 'Add Account'}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Accounts</Text>
        {accounts.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No accounts yet. Add one above.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {accounts.map((acc) => (
              <View key={acc.id} style={[styles.accountCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>{acc.name}</Text>
                  <Text style={[styles.accountBalance, { color: theme.colors.textSecondary }]}>
                    {currencySymbol}{acc.balance.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.dangerButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDelete(acc.id)}
                >
                  <Text style={styles.dangerButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 32, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: { marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  currency: { fontSize: 18, fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '600' },
  primaryButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  primaryButtonText: { color: '#FFF', fontWeight: '700' },
  list: { gap: 12 },
  accountCard: { marginHorizontal: 0, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountName: { fontSize: 16, fontWeight: '600' },
  accountBalance: { fontSize: 14, marginTop: 2 },
  dangerButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  dangerButtonText: { color: '#FFF', fontWeight: '700' },
  emptyText: { fontSize: 14 },
});
