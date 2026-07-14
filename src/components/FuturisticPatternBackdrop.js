import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

function DriftOrb({ size, color, x, y, delay = 0, duration = 9000 }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, [t, delay, duration]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.25, 0.55]),
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, 28]) },
      { translateY: interpolate(t.value, [0, 1], [0, -22]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.18]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
        style,
      ]}
    />
  );
}

function ScanGrid() {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, [shift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(shift.value, [0, 1], [0, 40]) },
      { translateX: interpolate(shift.value, [0, 1], [0, -24]) },
    ],
  }));

  const lines = [];
  for (let i = 0; i < 14; i += 1) {
    lines.push(<View key={`h${i}`} style={[styles.hLine, { top: i * 48 }]} />);
  }
  for (let i = 0; i < 10; i += 1) {
    lines.push(<View key={`v${i}`} style={[styles.vLine, { left: i * 56 }]} />);
  }

  return (
    <Animated.View style={[styles.grid, style]}>{lines}</Animated.View>
  );
}

/**
 * Futuristic teal motion field — drifting orbs + living grid (no photos).
 */
export function FuturisticPatternBackdrop() {
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 1], [0.12, 0.28]),
    transform: [
      { translateY: interpolate(sweep.value, [0, 1], [-H * 0.15, H * 0.1]) },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#07090d' }]} />

      <ScanGrid />

      <DriftOrb
        size={220}
        color="rgba(45,212,191,0.22)"
        x={-40}
        y={H * 0.08}
        duration={10000}
      />
      <DriftOrb
        size={180}
        color="rgba(56,189,248,0.16)"
        x={W * 0.55}
        y={H * 0.02}
        delay={400}
        duration={12000}
      />
      <DriftOrb
        size={260}
        color="rgba(45,212,191,0.12)"
        x={W * 0.2}
        y={H * 0.45}
        delay={800}
        duration={14000}
      />

      <Animated.View style={[styles.sweep, sweepStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(45,212,191,0.35)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <LinearGradient
        colors={[
          'rgba(7,9,13,0.35)',
          'rgba(7,9,13,0.15)',
          'rgba(7,9,13,0.75)',
          '#07090d',
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
  },
  grid: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: W + 160,
    height: H + 160,
    opacity: 0.45,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(45,212,191,0.08)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(45,212,191,0.07)',
  },
  sweep: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 90,
  },
});
