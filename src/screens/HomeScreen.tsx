import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ExpenseRepository } from '../data/repositories/ExpenseRepository';
import { lightTheme, darkTheme } from '../constants/theme';
import { getCurrencySymbol, formatCurrency } from '../utils/export';

export const HomeScreen: React.FC = () => {
  const { expenses, loading } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const { currency, theme: themeMode } = useSettingsStore();
  const expenseRepo = useMemo(() => new ExpenseRepository(), []);
  
  const [monthlyStats, setMonthlyStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    topCategory: '',
  });

  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    calculateMonthlyStats();
  }, [expenses, categories]);

  const calculateMonthlyStats = async () => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');

    const totalIncome = await expenseRepo.getTotalByTypeAndDateRange('income', start, end);
    const totalExpense = await expenseRepo.getTotalByTypeAndDateRange('expense', start, end);
    const categoryTotals = await expenseRepo.getCategoryTotals(start, end);

    let topCategory = 'N/A';
    if (categoryTotals.length > 0 && categories.length > 0) {
      const topCat = categories.find(c => c.id === categoryTotals[0].categoryId);
      topCategory = topCat?.name || 'N/A';
    }

    setMonthlyStats({
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      topCategory,
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {format(new Date(), 'MMMM yyyy')}
        </Text>
      </View>

      {/* Main Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary }, theme.shadows.lg]}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(totalBalance, currencySymbol)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Income</Text>
            <Text style={[styles.balanceItemValue, { color: theme.colors.card3 }]}>
              {formatCurrency(monthlyStats.totalIncome, currencySymbol)}
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Expense</Text>
            <Text style={[styles.balanceItemValue, { color: theme.colors.card4 }]}>
              {formatCurrency(monthlyStats.totalExpense, currencySymbol)}
            </Text>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card1 }, theme.shadows.md]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Net Savings</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            {formatCurrency(monthlyStats.netSavings, currencySymbol)}
          </Text>
          <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
            This Month
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card2 }, theme.shadows.md]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Top Category</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text, fontSize: 18 }]}>
            {monthlyStats.topCategory}
          </Text>
          <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
            Highest Spending
          </Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Transactions
        </Text>
        {expenses.slice(0, 5).map((expense) => {
          const category = categories.find(c => c.id === expense.categoryId);
          const account = accounts.find(a => a.id === expense.accountId);
          
          return (
            <View
              key={expense.id}
              style={[styles.transactionCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category?.color || theme.colors.primary }]}>
                <Text style={styles.categoryIconText}>
                  {category?.name.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
                  {category?.name || 'Unknown'}
                </Text>
                <Text style={[styles.transactionNote, { color: theme.colors.textSecondary }]}>
                  {expense.note || 'No note'}
                </Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: expense.type === 'income' ? theme.colors.income : theme.colors.expense },
                ]}
              >
                {expense.type === 'income' ? '+' : '-'}
                {formatCurrency(expense.amount, currencySymbol)}
              </Text>
            </View>
          );
        })}
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
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  balanceCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  balanceItemValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  summarySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionNote: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
