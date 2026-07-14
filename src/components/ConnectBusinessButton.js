import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

/**
 * High-production Connect CTA — shimmer sweep, glow pulse, expanding rail.
 */
export function ConnectBusinessButton({
  label = 'Connect your business',
  onPress,
}) {
  const { colors, fonts } = useTheme();
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const glow = useSharedValue(0);
  const enter = useSharedValue(0);
  const widthSV = useSharedValue(320);

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [enter, shimmer, glow]);

  const shellStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: interpolate(enter.value, [0, 1], [28, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.985]) },
    ],
    shadowOpacity: interpolate(glow.value, [0, 1], [0.18, 0.45]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, 0.15]),
    transform: [
      { translateX: interpolate(pressed.value, [0, 1], [0, -14]) },
    ],
  }));

  const railStyle = useAnimatedStyle(() => {
    const collapsed = 56;
    const expanded = Math.max(widthSV.value - 10, collapsed);
    return {
      width: interpolate(pressed.value, [0, 1], [collapsed, expanded]),
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [0, 1],
          [-120, widthSV.value + 40],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(pressed.value, [0, 1], [0.55, 0]),
  }));

  const setPressed = (next) => {
    pressed.value = withTiming(next ? 1 : 0, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
        },
        shellStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onLayout={(e) => {
          widthSV.value = e.nativeEvent.layout.width;
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.pressable}
      >
        <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />

        <Animated.Text
          style={[
            styles.label,
            { color: colors.onAccent, fontFamily: fonts.sansBold },
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        <Animated.View
          style={[
            styles.rail,
            { backgroundColor: 'rgba(0,0,0,0.16)' },
            railStyle,
          ]}
        >
          <View style={styles.railInner}>
            <Feather name="arrow-right" size={20} color={colors.onAccent} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 999,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 10,
  },
  pressable: {
    height: 60,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingLeft: 26,
    paddingRight: 10,
  },
  label: {
    fontSize: 17,
    letterSpacing: -0.2,
    zIndex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: 'rgba(255,255,255,0.28)',
    transform: [{ skewX: '-18deg' }],
  },
  rail: {
    position: 'absolute',
    top: 5,
    right: 5,
    bottom: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  railInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
