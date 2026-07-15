import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * React Native port of the AI processing-states loader.
 * (Trusty is Expo RN — not a shadcn/Tailwind web app.)
 *
 * Variants: shimmer-text | dots | loading-line | spinner | pulse-ring
 */
export function AiLoader({
  variant = 'shimmer-text',
  text = 'Processing…',
  style,
}) {
  const { colors } = useTheme();

  if (variant === 'dots') {
    return <DotsLoader colors={colors} style={style} />;
  }
  if (variant === 'loading-line') {
    return <LineLoader colors={colors} style={style} />;
  }
  if (variant === 'spinner' || variant === 'pulse-ring') {
    return <SpinLoader colors={colors} style={style} />;
  }
  return <ShimmerTextLoader colors={colors} text={text} style={style} />;
}

function ShimmerTextLoader({ colors, text, style }) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={[styles.row, style]}>
      <Feather name="zap" size={14} color={colors.accent} />
      <Animated.Text
        style={[
          styles.shimmerText,
          { color: colors.accent, opacity: pulse },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

function DotsLoader({ colors, style }) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  const c = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const make = (v, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 420,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    const loops = [make(a, 0), make(b, 160), make(c, 320)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [a, b, c]);

  const dot = (v) => ({
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
      {
        scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }),
      },
    ],
  });

  return (
    <View
      style={[
        styles.dotsWrap,
        {
          backgroundColor: colors.accentSoft,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[styles.dot, { backgroundColor: colors.accent }, dot(a)]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: colors.accent }, dot(b)]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: colors.accent }, dot(c)]}
      />
    </View>
  );
}

function LineLoader({ colors, style }) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  return (
    <View
      style={[
        styles.lineTrack,
        { backgroundColor: colors.surfaceAlt },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.lineSweep,
          {
            backgroundColor: colors.accent,
            transform: [
              {
                translateX: x.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-80, 220],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

function SpinLoader({ colors, style }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rot]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              rotate: rot.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Feather name="loader" size={18} color={colors.accent} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shimmerText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  lineTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  lineSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    borderRadius: 2,
    opacity: 0.9,
  },
});
