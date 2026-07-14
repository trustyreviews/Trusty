import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Compact MotionSites-style primary CTA — not a full-bleed rail bar.
 */
export function HeroCta({
  label = 'Try the demo',
  onPress,
  accent = '#2dd4bf',
  ink = '#07090d',
}) {
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 180 });
      }}
      style={[styles.btn, { backgroundColor: accent }, style]}
    >
      <Text style={[styles.label, { color: ink }]}>{label}</Text>
      <View style={[styles.arrow, { backgroundColor: ink }]}>
        <Feather name="arrow-right" size={16} color={accent} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 22,
    paddingRight: 8,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#2dd4bf',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
