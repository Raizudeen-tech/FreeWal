import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';

type ThemeOption = 'system' | 'light' | 'dark';

interface ThemeToggleProps {
  value: ThemeOption;
  onValueChange: (value: ThemeOption) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onValueChange }) => {
  const colorScheme = useColorScheme();
  const resolved = value === 'system' ? colorScheme : value;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  const options: ThemeOption[] = ['system', 'light', 'dark'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.button,
            value === option && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text
            style={[
              styles.text,
              { color: theme.colors.text },
              value === option && { color: '#FFF' },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    flexShrink: 1,
    maxWidth: '65%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
