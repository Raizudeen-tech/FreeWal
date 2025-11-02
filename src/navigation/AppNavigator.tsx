import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../screens/HomeScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { EditExpenseScreen } from '../screens/EditExpenseScreen';

import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';

import DatabaseService from '../data/database/DatabaseService';
import { seedDefaultCategories } from '../utils/seedData';
import { getTheme } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { theme: themeMode, useMaterial3 } = useSettingsStore();
  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = getTheme(resolvedTheme === 'dark' ? 'dark' : 'light', useMaterial3);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          height: 56 + insets.bottom,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Add" component={AddExpenseScreen} options={{ title: 'Add' }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { fetchExpenses } = useExpenseStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchAccounts } = useAccountStore();
  const { theme: themeMode, useMaterial3 } = useSettingsStore();
  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = getTheme(resolvedTheme === 'dark' ? 'dark' : 'light', useMaterial3);

  const navTheme = {
    ...(resolvedTheme === 'dark' ? NavDarkTheme : NavDefaultTheme),
    colors: {
      ...(resolvedTheme === 'dark' ? NavDarkTheme.colors : NavDefaultTheme.colors),
      background: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.primary,
    },
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await DatabaseService.initialize();
        await seedDefaultCategories();
        await fetchCategories();
        await fetchAccounts();
        await fetchExpenses();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    initializeApp();
  }, [fetchCategories, fetchAccounts, fetchExpenses]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Accounts" component={AccountsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


