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

/**
 * MotionSites-style pill toggle with optional sublabels.
 */
export function SceneToggle({
  value,
  onChange,
  left = 'Before',
  right = 'After',
  leftSub,
  rightSub,
}) {
  const t = useSharedValue(value === 'after' ? 1 : 0);
  const tall = !!(leftSub || rightSub);

  useEffect(() => {
    t.value = withTiming(value === 'after' ? 1 : 0, {
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [value, t]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [0, 1], [3, tall ? 110 : 84]) }],
  }));

  const leftStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['#12151a', 'rgba(247,248,245,0.5)']),
  }));

  const rightStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['rgba(247,248,245,0.5)', '#12151a']),
  }));

  const leftSubStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['#3a414a', 'rgba(247,248,245,0.35)']),
  }));

  const rightSubStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], ['rgba(247,248,245,0.35)', '#3a414a']),
  }));

  return (
    <View style={[styles.shell, tall && styles.shellTall, tall && styles.shellWide]}>
      <Animated.View
        style={[styles.thumb, tall && styles.thumbTall, tall && styles.thumbWide, thumbStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'before' }}
        onPress={() => onChange('before')}
        style={styles.side}
      >
        <Animated.Text style={[styles.label, leftStyle]}>{left}</Animated.Text>
        {leftSub ? (
          <Animated.Text style={[styles.sub, leftSubStyle]}>{leftSub}</Animated.Text>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'after' }}
        onPress={() => onChange('after')}
        style={styles.side}
      >
        <Animated.Text style={[styles.label, rightStyle]}>{right}</Animated.Text>
        {rightSub ? (
          <Animated.Text style={[styles.sub, rightSubStyle]}>{rightSub}</Animated.Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: 168,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(18,21,26,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 3,
    position: 'relative',
  },
  shellTall: {
    height: 52,
  },
  shellWide: {
    width: 220,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    left: 0,
    width: 80,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#f4f1ea',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  thumbTall: {
    height: 46,
  },
  thumbWide: {
    width: 106,
  },
  side: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sub: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
