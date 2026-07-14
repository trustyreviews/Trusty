import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const ACCENT = '#2dd4bf';
const INK = '#f7f8f5';
const MUTED = 'rgba(247,248,245,0.55)';
const GLASS = 'rgba(12,16,22,0.82)';
const LINE = 'rgba(45,212,191,0.35)';

const NODES = [
  { key: 'guests', label: 'Guests', sub: 'come back', angle: -90 },
  { key: 'reviews', label: 'Reviews', sub: 'flow in', angle: 0 },
  { key: 'trusty', label: 'Trusty', sub: 'helps you reply', angle: 90 },
  { key: 'grow', label: 'You grow', sub: 'more nights booked', angle: 180 },
];

/**
 * Spinning flywheel — guests ↔ reviews ↔ Trusty ↔ thriving business.
 */
export function HelpingLoop({ size = 220 }) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [spin, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-spin.value * 360}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.75]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.96, 1.04]) }],
  }));

  const r = size * 0.38;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={[styles.track, { width: size * 0.76, height: size * 0.76 }]} />
      <View style={[styles.trackInner, { width: size * 0.52, height: size * 0.52 }]} />

      <Animated.View
        style={[styles.ring, { width: size, height: size }, ringStyle]}
      >
        {NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <Animated.View
              key={node.key}
              style={[
                styles.node,
                {
                  left: size / 2 + x - 46,
                  top: size / 2 + y - 28,
                },
                counterStyle,
              ]}
            >
              <Text style={styles.nodeLabel}>{node.label}</Text>
              <Text style={styles.nodeSub}>{node.sub}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>

      <View style={styles.hub}>
        <Text style={styles.hubTitle}>Loop</Text>
        <Text style={styles.hubSub}>we help{'\n'}each other</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    backgroundColor: 'rgba(45,212,191,0.12)',
  },
  track: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: LINE,
    borderStyle: 'dashed',
  },
  trackInner: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.18)',
  },
  ring: {
    position: 'absolute',
  },
  node: {
    position: 'absolute',
    width: 92,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  nodeLabel: {
    color: INK,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  nodeSub: {
    marginTop: 2,
    color: MUTED,
    fontSize: 10,
    textAlign: 'center',
  },
  hub: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(8,12,16,0.9)',
    borderWidth: 1.5,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hubTitle: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hubSub: {
    marginTop: 4,
    color: INK,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
