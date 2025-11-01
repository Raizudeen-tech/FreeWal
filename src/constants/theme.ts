export const lightTheme = {
  colors: {
    primary: '#6366F1', // Indigo
    secondary: '#EC4899', // Pink
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
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
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#818CF8', // Lighter Indigo for dark mode
    secondary: '#F472B6', // Lighter Pink
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',

    // Adjusted card colors for dark mode
    card1: '#78350F', // Dark gold/brown
    card2: '#1E40AF', // Darker blue
    card3: '#065F46', // Darker green
    card4: '#86198F', // Darker pink/purple
    card5: '#3730A3', // Darker indigo
    card6: '#7C2D12', // Darker orange

    // Adjusted category colors for dark mode
    categoryColors: [
      '#FCA5A5', // Lighter Red
      '#FDBA74', // Lighter Orange
      '#FDE047', // Lighter Yellow
      '#86EFAC', // Lighter Green
      '#93C5FD', // Lighter Blue
      '#C4B5FD', // Lighter Purple
      '#F9A8D4', // Lighter Pink
      '#6EE7B7', // Lighter Teal
    ],
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export type Theme = typeof lightTheme;
