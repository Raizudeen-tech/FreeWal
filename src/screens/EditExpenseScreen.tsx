import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { format } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getTheme } from '../constants/theme';
import { getCurrencySymbol } from '../utils/export';
import { Expense } from '../data/models';
import { ThemedDialog } from '../components/ThemedDialog';

export const EditExpenseScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { expenseId } = route.params;
  const { expenses, updateExpense, deleteExpense } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const { currency, theme: themeMode, useMaterial3 } = useSettingsStore();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const systemScheme = useColorScheme() || 'light';
  const resolvedMode = themeMode === 'system' ? systemScheme : themeMode;
  const theme = getTheme(resolvedMode === 'dark' ? 'dark' : 'light', useMaterial3);
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    const expenseToEdit = expenses.find((e) => e.id === expenseId);
    if (expenseToEdit) {
      setExpense(expenseToEdit);
      setAmount(expenseToEdit.amount.toString());
      setSelectedType(expenseToEdit.type);
      setSelectedCategory(expenseToEdit.categoryId);
      setSelectedAccount(expenseToEdit.accountId);
      setNote(expenseToEdit.note || '');
      setDate(expenseToEdit.date);
    }
  }, [expenseId, expenses]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: Date) => {
    setDate(format(selectedDate, 'yyyy-MM-dd'));
    hideDatePicker();
  };

  const handleUpdate = async () => {
    if (!expense) return;

    setLoading(true);
    try {
      await updateExpense({
        id: expense.id,
        amount: parseFloat(amount),
        categoryId: selectedCategory!,
        accountId: selectedAccount!,
        note,
        date,
        type: selectedType,
      });
      Alert.alert('Success', 'Transaction updated successfully');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!expense) return;
    
    try {
      await deleteExpense(expense.id);
      setShowDeleteDialog(false);
      Alert.alert('Success', 'Transaction deleted');
      navigation.navigate('Home');
    } catch {
      Alert.alert('Error', 'Failed to delete transaction');
    }
  };

  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>Transaction not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Transaction</Text>
      </View>

      {/* Form fields copied from AddExpenseScreen and adapted for editing */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
        <View style={[styles.amountContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>{currencySymbol}</Text>
          <TextInput
            style={[styles.amountInput, { color: theme.colors.text }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === category.id ? category.color : theme.colors.surface, borderColor: category.color, borderWidth: 1 },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[styles.categoryChipText, { color: selectedCategory === category.id ? '#FFF' : category.color }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Account</Text>
        <View style={styles.accountContainer}>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountChip,
                { backgroundColor: selectedAccount === account.id ? theme.colors.primary : theme.colors.surface },
              ]}
              onPress={() => setSelectedAccount(account.id)}
            >
              <Text style={[styles.accountChipText, { color: selectedAccount === account.id ? '#FFF' : theme.colors.text }]}>
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Note</Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Date</Text>
        <TouchableOpacity style={[styles.dateInput, { backgroundColor: theme.colors.surface }]} onPress={showDatePicker}>
          <Text style={{ color: theme.colors.text }}>{date}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          isDarkModeEnabled={resolvedMode === 'dark'}
          textColor={theme.colors.text}
          accentColor={theme.colors.primary}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }, theme.shadows.md]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Updating...' : 'Update'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: theme.colors.error, backgroundColor: 'transparent' }]}
          onPress={handleDelete}
        >
          <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ThemedDialog
        visible={showDeleteDialog}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction?"
        theme={theme}
        onDismiss={() => setShowDeleteDialog(false)}
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowDeleteDialog(false),
            style: 'default',
          },
          {
            text: 'Delete',
            onPress: confirmDelete,
            style: 'destructive',
          },
        ]}
      />
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  accountChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 80,
  },
  dateInput: {
    padding: 16,
    borderRadius: 12,
  },
  buttonContainer: {
    padding: 20,
  },
  saveButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
