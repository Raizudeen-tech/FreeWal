import { generateExpressiveTheme, getSystemSeedColor } from '../utils/materialColors';

// Material 3 Expressive theme generator
export function getMaterial3Theme(isDark: boolean) {
  const seedColor = getSystemSeedColor();
  return generateExpressiveTheme(seedColor, isDark);
}

// Helper to convert Material 3 scheme to app theme colors
function material3ToAppColors(m3: ReturnType<typeof generateExpressiveTheme>, isDark: boolean) {
  return {
    primary: m3.primary,
    onPrimary: m3.onPrimary,
    secondary: m3.secondary,
    background: isDark ? '#0F1419' : m3.background, // Darker background for better contrast
    surface: isDark ? '#1A1F26' : m3.surface, // Darker surface
    surfaceElevated: isDark ? '#242A33' : '#FFFFFF', // More elevated contrast
    text: isDark ? '#F0F4F8' : m3.onBackground, // Brighter text in dark mode
    textSecondary: isDark ? '#B8C5D0' : m3.onSurfaceVariant, // More visible secondary text
    border: isDark ? '#3D4451' : m3.outlineVariant, // More visible borders
    error: isDark ? '#FF6B6B' : m3.error, // Brighter error color
    onError: m3.onError,
    success: isDark ? '#51CF66' : '#10B981',
    warning: isDark ? '#FFD93D' : '#F59E0B',
    info: m3.tertiary,
    
    // Card colors using Material 3 containers
    card1: m3.primaryContainer,
    card2: m3.secondaryContainer,
    card3: m3.tertiaryContainer,
    card4: m3.errorContainer,
    card5: m3.primaryContainer,
    card6: m3.secondaryContainer,
    
    // Category colors - mix of Material 3 and custom
    categoryColors: [
      isDark ? '#FF6B6B' : m3.error, // Brighter red
      isDark ? '#FFA94D' : '#FB923C', // Brighter orange
      isDark ? '#FFD93D' : '#FBBF24', // Brighter yellow
      isDark ? '#51CF66' : '#34D399', // Brighter green
      m3.primary, // Blue
      m3.tertiary, // Purple
      m3.secondary, // Pink
      isDark ? '#3BC9DB' : '#14B8A6', // Brighter teal
    ],
    
    // Income/Expense colors
    income: isDark ? '#51CF66' : '#10B981',
    expense: isDark ? '#FF6B6B' : m3.error,
    
    // Material 3 specific colors
    m3: {
      primaryContainer: m3.primaryContainer,
      onPrimaryContainer: m3.onPrimaryContainer,
      secondaryContainer: m3.secondaryContainer,
      onSecondaryContainer: m3.onSecondaryContainer,
      tertiaryContainer: m3.tertiaryContainer,
      onTertiaryContainer: m3.onTertiaryContainer,
      surfaceVariant: m3.surfaceVariant,
      onSurfaceVariant: m3.onSurfaceVariant,
      outline: m3.outline,
      outlineVariant: m3.outlineVariant,
      errorContainer: m3.errorContainer,
      onErrorContainer: m3.onErrorContainer,
    },
    
    // Dialog specific colors
    dialog: {
      background: isDark ? '#1F2630' : '#FFFFFF',
      overlay: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
    },
  };
}

export const lightTheme = {
  colors: {
    primary: '#6366F1', // Indigo
    onPrimary: '#FFFFFF',
    secondary: '#EC4899', // Pink
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF', // Elevated surfaces (modals, cards)
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    onError: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Card colors (pastel palette)
    card1: '#FEF3C7', // Light yellow
    card2: '#DBEAFE', // Light blue
    card3: '#D1FAE5', // Light green
    card4: '#FCE7F3', // Light pink
    card5: '#E0E7FF', // Light indigo
    card6: '#FED7AA', // Light orange
    
    // Category colors
    categoryColors: [
      '#F87171', // Red
      '#FB923C', // Orange
      '#FBBF24', // Yellow
      '#34D399', // Green
      '#60A5FA', // Blue
      '#A78BFA', // Purple
      '#F472B6', // Pink
      '#14B8A6', // Teal
    ],
    
    // Income/Expense colors
    income: '#10B981',
    expense: '#EF4444',
    
    // Dialog specific colors
    dialog: {
      background: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#818CF8', // Lighter Indigo for dark mode
    onPrimary: '#1F2937',
    secondary: '#F472B6', // Lighter Pink
    background: '#0F1419', // Darker for better contrast
    surface: '#1A1F26', // Darker surface
    surfaceElevated: '#242A33', // Elevated surfaces with more contrast
    text: '#F0F4F8', // Brighter text
    textSecondary: '#B8C5D0', // More visible secondary text
    border: '#3D4451', // More visible borders
    error: '#FF6B6B', // Brighter red
    onError: '#1F2937',

    // Adjusted card colors for dark mode
    card1: '#78350F', // Dark gold/brown
    card2: '#1E40AF', // Darker blue
    card3: '#065F46', // Darker green
    card4: '#86198F', // Darker pink/purple
    card5: '#3730A3', // Darker indigo
    card6: '#7C2D12', // Darker orange

    // Adjusted category colors for dark mode
    categoryColors: [
      '#FF6B6B', // Brighter Red
      '#FFA94D', // Brighter Orange
      '#FFD93D', // Brighter Yellow
      '#51CF66', // Brighter Green
      '#4DABF7', // Brighter Blue
      '#B197FC', // Brighter Purple
      '#FF8AD8', // Brighter Pink
      '#3BC9DB', // Brighter Teal
    ],
    
    // Dialog specific colors
    dialog: {
      background: '#1F2630',
      overlay: 'rgba(0, 0, 0, 0.85)',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 4,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export type Theme = typeof lightTheme;

/**
 * Get the appropriate theme based on mode and Material 3 setting
 * @param mode - 'light' or 'dark'
 * @param useMaterial3 - whether to use Material 3 Expressive theming
 */
export function getTheme(mode: 'light' | 'dark', useMaterial3: boolean = false): Theme {
  const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
  
  if (!useMaterial3) {
    return baseTheme;
  }
  
  // Generate Material 3 theme and merge with base theme
  const m3Colors = material3ToAppColors(getMaterial3Theme(mode === 'dark'), mode === 'dark');
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...m3Colors,
    },
  };
}
