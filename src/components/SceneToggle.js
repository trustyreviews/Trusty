import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ACCENT = '#2dd4bf';

/**
 * MotionSites-style segmented Before / After control.
 */
export function SceneToggle({ value, onChange, left = 'Before', right = 'After' }) {
  const t = useSharedValue(value === 'after' ? 1 : 0);

  useEffect(() => {
    t.value = withTiming(value === 'after' ? 1 : 0, {
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [value, t]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [2, 78]) }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['#07090d', 'rgba(247,248,245,0.45)']),
  }));

  const rightStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['rgba(247,248,245,0.45)', '#07090d']),
  }));

  return (
    <View style={styles.shell}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'before' }}
        onPress={() => onChange('before')}
        style={styles.side}
      >
        <Animated.Text style={[styles.label, leftStyle]}>{left}</Animated.Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'after' }}
        onPress={() => onChange('after')}
        style={styles.side}
      >
        <Animated.Text style={[styles.label, rightStyle]}>{right}</Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: 156,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 2,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 0,
    width: 74,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  side: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
