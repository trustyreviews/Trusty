import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Build StyleSheet from current theme colors.
 * factory: (colors, fonts) => style defs object
 */
export function useThemedStyles(factory) {
  const { colors, fonts } = useTheme();
  return useMemo(
    () => StyleSheet.create(factory(colors, fonts)),
    [colors, fonts, factory]
  );
}
