import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useSettingsStore } from '../stores/settingsStore';
import { ExpenseRepository } from '../data/repositories/ExpenseRepository';
import DatabaseService from '../data/database/DatabaseService';
import { getTheme } from '../constants/theme';
import { getCurrencySymbol, formatCurrency } from '../utils/export';

const screenWidth = Dimensions.get('window').width;

// A safe wrapper for chart components
const SafeChart = ({ chart: Chart, data, ...props }: any) => {
  const hasValidData = () => {
    if (!data) return false;
    if (Array.isArray(data)) {
      // For PieChart
      return data.length > 0 && data.every(item => item && Number.isFinite(item.amount));
    }
    // For LineChart, BarChart
    if (data.datasets && data.datasets.length > 0) {
      const dataset = data.datasets[0];
      return dataset && dataset.data && dataset.data.length > 0 && dataset.data.every(Number.isFinite);
    }
    return false;
  };

  if (!hasValidData()) {
    return (
      <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: props.theme.colors.textSecondary }}>
          No data available
        </Text>
      </View>
    );
  }

  return <Chart data={data} {...props} />;
};

export const StatsScreen: React.FC = () => {
  const { expenses } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { currency, theme: themeMode, useMaterial3 } = useSettingsStore();
  const expenseRepo = useMemo(() => new ExpenseRepository(), []);

  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = getTheme(resolvedTheme === 'dark' ? 'dark' : 'light', useMaterial3);
  const currencySymbol = getCurrencySymbol(currency);
  const formatYAxisLabel = useCallback(
    (value: string) => {
      const n = Number(value);
      if (!isFinite(n)) return `${currencySymbol}0`;
      const rounded = Math.round(n);
      return `${currencySymbol}${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    },
    [currencySymbol]
  );

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('month');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any>({ labels: [], datasets: [{ data: [] }] });
  const [monthlyTrend, setMonthlyTrend] = useState<any>({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    loadChartData();
  }, [expenses, categories, selectedPeriod]);

  const loadChartData = async () => {
    // Guard until database ready to avoid native crashes
    if (!DatabaseService.isInitialized) return;
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');

    // Category distribution (Pie Chart)
    const catTotals = await expenseRepo.getCategoryTotals(start, end);
    // Build pie data and guard against zero/invalid totals which can break SVG paths
    const pieDataRaw = catTotals.slice(0, 6).map((item, index) => {
      const category = categories.find(c => c.id === item.categoryId);
      const amount = Number(item.total) || 0;
      return {
        name: category?.name || 'Unknown',
        amount,
        color: category?.color || theme.colors.categoryColors[index],
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      };
    });
    // Filter out non-positive amounts to avoid 0-sum pie charts (which can yield Infinity/NaN paths)
    const pieData = pieDataRaw.filter(d => Number.isFinite(d.amount) && d.amount > 0);
    const pieTotal = pieData.reduce((sum, d) => sum + d.amount, 0);
    setCategoryData(pieTotal > 0 ? pieData : []);

    // Daily spending (Bar Chart)
    const monthExpenses = await expenseRepo.getByDateRange(start, end);
    const dailyTotals: { [key: string]: number } = {};
    
    monthExpenses
      .filter(e => e.type === 'expense')
      .forEach(expense => {
        const day = format(new Date(expense.date), 'd');
        dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount;
      });

    const days = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b)).slice(-7);
    const amounts = days.map(day => {
      const v = Number(dailyTotals[day] || 0);
      return Number.isFinite(v) ? v : 0;
    });

    const dailyLabels = days.length > 0 ? days.map(d => `${d}`) : [''];
    const dailyDataset = amounts.length > 0 ? amounts : [0];
    setDailyData({
      labels: dailyLabels,
      datasets: [{ data: dailyDataset }],
    });

    // Monthly trend (Line Chart)
    const months = [];
    const monthlyTotals = [];
    
  for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
  const totalRaw = await expenseRepo.getTotalByTypeAndDateRange('expense', monthStart, monthEnd);
  const total = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : 0;
      
      months.push(format(monthDate, 'MMM'));
      monthlyTotals.push(total);
    }

    // Ensure dataset has finite numbers only
    const monthlySanitized = monthlyTotals.map(v => (Number.isFinite(Number(v)) ? Number(v) : 0));
    setMonthlyTrend({
      labels: months,
      datasets: [{ data: monthlySanitized.length > 0 ? monthlySanitized : [0] }],
    });
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Statistics
        </Text>
      </View>

      {/* Category Distribution */}
      <View style={styles.chartSection}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Spending by Category
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
          {categoryData.length > 0 ? (
            <SafeChart
              chart={PieChart}
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              theme={theme}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                No data available
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Daily Spending */}
      <View style={styles.chartSection}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Daily Spending (Last 7 Days)
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
          <SafeChart
            chart={BarChart}
            data={dailyData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            // @ts-ignore react-native-chart-kit supports this prop at runtime
            formatYLabel={formatYAxisLabel}
            fromZero
            showValuesOnTopOfBars
            style={{
              borderRadius: 16,
            }}
            theme={theme}
          />
        </View>
      </View>

      {/* Monthly Trend */}
      <View style={styles.chartSection}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          6-Month Expense Trend
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
          <SafeChart
            chart={LineChart}
            data={monthlyTrend}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            // @ts-ignore react-native-chart-kit supports this prop at runtime
            formatYLabel={formatYAxisLabel}
            style={{
              borderRadius: 16,
            }}
            theme={theme}
          />
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Quick Stats
        </Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card1 }, theme.shadows.sm]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              Total Transactions
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {expenses.length}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card2 }, theme.shadows.sm]}>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              Categories
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
              {categories.length}
            </Text>
          </View>
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
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
});
