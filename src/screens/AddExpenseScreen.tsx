import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, useColorScheme, KeyboardAvoidingView, Platform } from "react-native";
import { format } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useExpenseStore } from "../stores/expenseStore";
import { useCategoryStore } from "../stores/categoryStore";
import { useAccountStore } from "../stores/accountStore";
import { useSettingsStore } from "../stores/settingsStore";
import { getTheme } from "../constants/theme";
import { getCurrencySymbol } from "../utils/export";

export const AddExpenseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addExpense } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts, addAccount, loading: accountsLoading } = useAccountStore();
  const { currency, theme: themeMode, useMaterial3 } = useSettingsStore();
  const systemScheme = useColorScheme() || "light";
  const resolvedMode = themeMode === "system" ? systemScheme : themeMode;
  const theme = getTheme(resolvedMode === 'dark' ? 'dark' : 'light', useMaterial3);
  const currencySymbol = getCurrencySymbol(currency);

  const [amount, setAmount] = useState("");
  const [selectedType, setSelectedType] = useState<"expense" | "income">("expense");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(
    accounts.length > 0 ? accounts[0].id : null
  );
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // When accounts load or change, auto-select the first one if none selected
  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const handleCreateDefaultAccount = async () => {
    try {
      await addAccount({ name: "Main Account", balance: 0, currency });
      // selection will be set by the effect above when accounts update
      Alert.alert("Account created", "A default account has been added.");
    } catch (e) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: Date) => {
    setDate(format(selectedDate, "yyyy-MM-dd"));
    hideDatePicker();
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!selectedAccount) {
      Alert.alert("Error", "Please select an account");
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        categoryId: selectedCategory!,
        accountId: selectedAccount!,
        note,
        date,
        type: selectedType,
      });

      Alert.alert("Success", `${selectedType === "income" ? "Income" : "Expense"} added successfully`);

      setAmount("");
      setNote("");
      setSelectedCategory(null);
      setDate(format(new Date(), "yyyy-MM-dd"));

      navigation.navigate("Home");
    } catch {
      Alert.alert("Error", "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const scrollRef = useRef<ScrollView>(null);
  const [noteOffsetY, setNoteOffsetY] = useState(0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    > 
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Transaction</Text>
      </View>
      {/* Type Selector */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: theme.colors.surface },
              selectedType === 'expense' && { backgroundColor: theme.colors.expense },
              theme.shadows.sm,
            ]}
            onPress={() => setSelectedType('expense')}
          >
            <Text
              style={[
                styles.typeText,
                { color: theme.colors.text },
                selectedType === 'expense' && { color: '#FFF' },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: theme.colors.surface },
              selectedType === 'income' && { backgroundColor: theme.colors.income },
              theme.shadows.sm,
            ]}
            onPress={() => setSelectedType('income')}
          >
            <Text
              style={[
                styles.typeText,
                { color: theme.colors.text },
                selectedType === 'income' && { color: '#FFF' },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
            <View style={[styles.amountContainer, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
              <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>{currencySymbol}</Text>
              <TextInput
                style={[styles.amountInput, { color: theme.colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          selectedCategory === category.id ? category.color : theme.colors.surface,
                        borderColor: category.color,
                        borderWidth: 1,
                      },
                      theme.shadows.sm,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: selectedCategory === category.id ? "#FFF" : category.color,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Account Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Account</Text>
            {accounts.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No accounts found</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>You need an account to record a transaction.</Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, theme.shadows.sm]}
                  onPress={handleCreateDefaultAccount}
                  disabled={accountsLoading}
                >
                  <Text style={styles.primaryButtonText}>{accountsLoading ? 'Creating…' : 'Create default account'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountContainer}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountChip,
                      { backgroundColor: theme.colors.surface },
                      selectedAccount === account.id && {
                        backgroundColor: theme.colors.primary,
                      },
                      theme.shadows.sm,
                    ]}
                    onPress={() => setSelectedAccount(account.id)}
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        { color: theme.colors.text },
                        selectedAccount === account.id && { color: "#FFF" },
                      ]}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Note Input */}
          <View style={styles.section} onLayout={(e) => setNoteOffsetY(e.nativeEvent.layout.y)}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Note (Optional)</Text>
            <TextInput
              style={[
                styles.noteInput,
                { backgroundColor: theme.colors.surface, color: theme.colors.text },
                theme.shadows.sm,
              ]}
              value={note}
              onChangeText={setNote}
              onFocus={() => {
                // ensure note is visible when keyboard opens
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollTo({ y: Math.max(noteOffsetY - 12, 0), animated: true });
                });
              }}
              placeholder="Add a note..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              scrollEnabled
            />
          </View>

          {/* Date Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Date</Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                { backgroundColor: theme.colors.surface },
                theme.shadows.sm,
              ]}
              onPress={showDatePicker}
            >
              <Text style={{ color: theme.colors.text }}>{date}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              date={new Date(date)}
              locale="en"
              isDarkModeEnabled={resolvedMode === 'dark'}
              textColor={theme.colors.text}
              accentColor={theme.colors.primary}
            />
          </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: theme.colors.primary },
          theme.shadows.lg,
          (loading || accounts.length === 0 || !selectedAccount) && { opacity: 0.5 },
        ]}
        onPress={handleSave}
        disabled={loading || accounts.length === 0 || !selectedAccount}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Transaction'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
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
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "700",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  accountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  accountChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  accountChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  noteInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 80,
    maxHeight: 160,
  },
  dateInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  saveButton: {
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
