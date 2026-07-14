import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SceneToggle } from './SceneToggle';

// Real Unsplash photo — empty patio (not AI). Same frame for Empty → Packed.
const HERO = require('../../assets/scene/before-empty.jpg');

const { width: W } = Dimensions.get('window');
const FRAME_H = Math.min(W * 0.78, 340);

function QueueFigure({ delay, x, h }) {
  const o = useSharedValue(0);

  useEffect(() => {
    o.value = withDelay(
      delay,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
  }, [o, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: o.value * 0.88,
    transform: [{ translateY: interpolate(o.value, [0, 1], [10, 0]) }],
  }));

  return (
    <Animated.View style={[styles.figure, { left: x, height: h, width: h * 0.38 }, style]}>
      <View style={[styles.head, { width: h * 0.22, height: h * 0.22 }]} />
      <View style={[styles.body, { height: h * 0.62 }]} />
    </Animated.View>
  );
}

/**
 * MotionSites-style restaurant hero — same photo morphs Empty → Packed night.
 */
export function RestaurantHeroScene({ scene, onChange }) {
  const morph = useSharedValue(scene === 'after' ? 1 : 0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    morph.value = withTiming(scene === 'after' ? 1 : 0, {
      duration: 900,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [scene, morph]);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breathe]);

  const photoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(breathe.value, [0, 1], [1.02, 1.08]) },
    ],
  }));

  const dayVeil = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0.08, 0]),
  }));

  const nightVeil = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 0.72]),
  }));

  const warmLights = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 1]),
  }));

  const queueStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 1]),
  }));

  const emptyChip = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.45], [1, 0]),
  }));

  const packedChip = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0.55, 1], [0, 1]),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        <Animated.View style={[styles.photoWrap, photoStyle]}>
          <Image source={HERO} style={styles.photo} resizeMode="cover" />
        </Animated.View>

        {/* Soft daylight wash (Empty) */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, dayVeil]}>
          <LinearGradient
            colors={['rgba(180,200,220,0.15)', 'transparent', 'rgba(255,255,255,0.08)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Night sky + depth (Packed) */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, nightVeil]}>
          <LinearGradient
            colors={[
              'rgba(4,10,22,0.55)',
              'rgba(8,14,28,0.35)',
              'rgba(2,6,14,0.55)',
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Warm interior / string lights bloom */}
        <Animated.View pointerEvents="none" style={[styles.lights, warmLights]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,170,70,0.22)', 'rgba(255,140,40,0.35)']}
            locations={[0.35, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glowA} />
          <View style={styles.glowB} />
          <View style={styles.glowC} />
        </Animated.View>

        {/* Line at the door */}
        <Animated.View pointerEvents="none" style={[styles.queue, queueStyle]}>
          <View style={styles.doorGlow} />
          <QueueFigure delay={80} x={18} h={54} />
          <QueueFigure delay={140} x={38} h={58} />
          <QueueFigure delay={200} x={58} h={52} />
          <QueueFigure delay={260} x={78} h={56} />
          <QueueFigure delay={320} x={98} h={50} />
          <QueueFigure delay={380} x={118} h={54} />
          <Text style={styles.queueLabel}>Line at the door</Text>
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(7,9,13,0.55)', 'rgba(7,9,13,0.92)']}
          locations={[0.45, 0.78, 1]}
          style={styles.bottomFade}
        />

        <Animated.View style={[styles.chip, styles.chipLeft, emptyChip]}>
          <Text style={styles.chipText}>Empty · quiet night</Text>
        </Animated.View>
        <Animated.View style={[styles.chip, styles.chipRight, packedChip]}>
          <Text style={styles.chipTextPacked}>Packed · lights on</Text>
        </Animated.View>

        <View style={styles.toggleOverlay}>
          <SceneToggle
            value={scene}
            onChange={onChange}
            left="Empty"
            right="Packed"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  frame: {
    width: '100%',
    height: FRAME_H,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0a0c10',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photoWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  lights: {
    ...StyleSheet.absoluteFillObject,
  },
  glowA: {
    position: 'absolute',
    top: '28%',
    left: '18%',
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255,190,90,0.28)',
  },
  glowB: {
    position: 'absolute',
    top: '22%',
    left: '48%',
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: 'rgba(255,170,70,0.22)',
  },
  glowC: {
    position: 'absolute',
    top: '34%',
    right: '16%',
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: 'rgba(255,200,110,0.2)',
  },
  queue: {
    position: 'absolute',
    left: 16,
    bottom: 78,
    width: 180,
    height: 90,
  },
  doorGlow: {
    position: 'absolute',
    left: 10,
    bottom: 0,
    width: 150,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,160,60,0.18)',
  },
  figure: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  head: {
    borderRadius: 999,
    backgroundColor: 'rgba(8,10,14,0.92)',
    marginBottom: 3,
  },
  body: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'rgba(8,10,14,0.9)',
  },
  queueLabel: {
    position: 'absolute',
    right: -8,
    top: 6,
    color: 'rgba(255,220,170,0.92)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
  },
  chip: {
    position: 'absolute',
    top: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(7,9,13,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipLeft: { left: 14 },
  chipRight: { right: 14 },
  chipText: {
    color: 'rgba(247,248,245,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextPacked: {
    color: '#ffc56a',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
  },
});
