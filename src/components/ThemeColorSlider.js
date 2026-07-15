import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const THEME_ICONS = {
  midnight: 'moon',
  daylight: 'sun',
  slate: 'cloud',
  forest: 'feather',
};

/**
 * Compact theme picker — tap an icon to switch themes.
 */
export function ThemeColorSlider({ style }) {
  const { themes, themeId, setThemeId, colors } = useTheme();

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme color"
    >
      {themes.map((theme) => {
        const active = theme.id === themeId;
        const icon = THEME_ICONS[theme.id] ?? 'circle';
        return (
          <Pressable
            key={theme.id}
            onPress={() => setThemeId(theme.id)}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={theme.label}
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: active ? colors.accentSoft : 'transparent',
                borderColor: active ? colors.accent : colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather
              name={icon}
              size={14}
              color={active ? colors.accent : colors.textDim}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
