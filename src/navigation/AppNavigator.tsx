import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../screens/HomeScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AccountsScreen } from '../screens/AccountsScreen';

import { useExpenseStore } from '../stores/expenseStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useSettingsStore } from '../stores/settingsStore';

import DatabaseService from '../data/database/DatabaseService';
import { seedDatabase, seedDefaultCategories } from '../utils/seedData';
import { useColorScheme } from 'react-native';

// ... existing imports

import { lightTheme, darkTheme } from '../constants/theme';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const { fetchExpenses } = useExpenseStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchAccounts } = useAccountStore();
  const { theme: themeMode } = useSettingsStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  const colorScheme = useColorScheme();
  const resolvedTheme = themeMode === 'system' ? colorScheme : themeMode;
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  // Map our app theme to React Navigation theme so headers, backgrounds, and cards match
  const navTheme = resolvedTheme === 'dark'
    ? {
        ...NavDarkTheme,
        colors: {
          ...NavDarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.primary,
        },
      }
    : {
        ...NavDefaultTheme,
        colors: {
          ...NavDefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.primary,
        },
      };
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.initialize();
      
      // Seed default categories if none exist
      await seedDefaultCategories();
      
      // Seed database with sample data
      // await seedDatabase();
      
      // Load data into stores
      await fetchCategories();
      await fetchAccounts();
      await fetchExpenses();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Add') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Accounts') {
              iconName = focused ? 'card' : 'card-outline';
            } else if (route.name === 'Categories') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
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
          safeAreaInsets: { bottom: insets.bottom },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{
            // hide the tab button; accessible via Settings navigation
            tabBarButton: () => null,
            title: 'Accounts',
          }}
        />
  <Tab.Screen name="Stats" component={StatsScreen} />
  <Tab.Screen name="Add" component={AddExpenseScreen} options={{ title: 'Add' }} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
