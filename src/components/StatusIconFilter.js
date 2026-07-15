import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Compact status filters — tap an icon/chip (matches Inbox status language).
 */
export const STATUS_FILTERS = [
  { id: 'all', label: 'All', kind: 'plain' },
  { id: 'replied', label: 'Replied', kind: 'check' },
  { id: 'resolved', label: 'Resolved', kind: 'checkMuted' },
  { id: 'not_resolved', label: 'Not Resolved', kind: 'danger' },
  { id: 'pending', label: 'Pending', kind: 'pending' },
];

export function StatusIconFilter({ value, onChange, style }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, style]} accessibilityRole="radiogroup">
      {STATUS_FILTERS.map((item) => {
        const active = value === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={({ pressed }) => [
              styles.chip,
              kindStyle(item.kind, active, colors),
              pressed && { opacity: 0.7 },
            ]}
          >
            {item.kind === 'check' || item.kind === 'checkMuted' ? (
              <Feather
                name="check-circle"
                size={13}
                color={
                  item.kind === 'checkMuted'
                    ? active
                      ? colors.accent
                      : colors.textDim
                    : active
                      ? colors.accent
                      : '#4ade80'
                }
              />
            ) : null}
            <Text
              style={[
                styles.label,
                {
                  color: labelColor(item.kind, active, colors),
                  fontFamily: active ? undefined : undefined,
                },
                active && styles.labelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function kindStyle(kind, active, colors) {
  if (kind === 'danger') {
    return {
      backgroundColor: active ? colors.dangerSoft : 'rgba(185, 28, 28, 0.22)',
      borderColor: active ? colors.dangerBorder : 'transparent',
    };
  }
  if (kind === 'pending') {
    return {
      backgroundColor: active ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.18)',
      borderColor: active ? colors.warning : 'transparent',
    };
  }
  if (kind === 'check' || kind === 'checkMuted') {
    return {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      paddingHorizontal: 4,
    };
  }
  return {
    backgroundColor: active ? colors.surfaceAlt : 'transparent',
    borderColor: active ? colors.border : 'transparent',
  };
}

function labelColor(kind, active, colors) {
  if (kind === 'danger') return colors.dangerText;
  if (kind === 'pending') return '#fbbf24';
  if (kind === 'check') return active ? colors.accent : '#4ade80';
  if (kind === 'checkMuted') return active ? colors.accent : colors.textMuted;
  return active ? colors.text : colors.textDim;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
  },
  labelActive: {
    fontWeight: '600',
  },
});
