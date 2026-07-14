import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

const PHOTOS = [
  require('../../assets/onboarding/restaurant-1.png'),
  require('../../assets/onboarding/cafe-2.png'),
  require('../../assets/onboarding/foodhall-3.png'),
  require('../../assets/onboarding/patio-4.png'),
];

const TILE_W = Math.min(W * 0.48, 240);
const TILE_H = TILE_W * 0.7;
const GAP = 14;
const STRIP_LEN = (TILE_W + GAP) * PHOTOS.length;

function PhotoTile({ source }) {
  return (
    <View style={styles.tile}>
      <Image source={source} style={styles.tileImg} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function MarqueeRow({ reverse = false, speed = 18000, tilt = 0 }) {
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = reverse ? -STRIP_LEN : 0;
    x.value = withRepeat(
      withTiming(reverse ? 0 : -STRIP_LEN, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [x, reverse, speed]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${tilt}deg` }],
  }));

  const seq = reverse
    ? [...PHOTOS].reverse().concat([...PHOTOS].reverse())
    : PHOTOS.concat(PHOTOS);

  return (
    <View style={styles.rowClip}>
      <Animated.View style={[styles.row, style]}>
        {seq.map((src, i) => (
          <PhotoTile key={`${reverse ? 'b' : 'a'}-${i}`} source={src} />
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * Full-bleed booming business photo motion — triple marquees + pulse veil.
 */
export function BusinessMotionBackdrop() {
  const pulse = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [pulse, breathe]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.12, 0.32]),
  }));

  const stackStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(breathe.value, [0, 1], [1, 1.04]),
      },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050505' }]} />

      <Animated.View style={[styles.stack, stackStyle]}>
        <MarqueeRow speed={24000} tilt={-2.5} />
        <View style={{ height: 12 }} />
        <MarqueeRow reverse speed={28000} tilt={1.8} />
        <View style={{ height: 12 }} />
        <MarqueeRow speed={21000} tilt={-1.2} />
      </Animated.View>

      <LinearGradient
        colors={[
          'rgba(5,5,5,0.5)',
          'rgba(5,5,5,0.28)',
          'rgba(5,5,5,0.75)',
          '#050505',
        ]}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.amberVeil, flashStyle]} />

      <LinearGradient
        colors={['rgba(255,176,32,0.18)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={styles.topGlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    top: H * 0.04,
    left: -W * 0.08,
    width: W * 1.16,
  },
  rowClip: {
    overflow: 'hidden',
    width: W * 1.16,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    width: STRIP_LEN * 2,
  },
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  tileImg: {
    width: '100%',
    height: '100%',
  },
  amberVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 140, 40, 0.14)',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.35,
  },
});
