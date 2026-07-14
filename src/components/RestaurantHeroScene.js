import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SceneToggle } from './SceneToggle';

const { width: W } = Dimensions.get('window');
const FRAME_H = Math.min(W * 0.72, 300);

/**
 * Simple flat restaurant graphic — Empty tables ↔ Packed night.
 * MotionSites-style toggle, Trusty theme, low detail.
 */
export function RestaurantHeroScene({ scene, onChange }) {
  const morph = useSharedValue(scene === 'after' ? 1 : 0);

  useEffect(() => {
    morph.value = withTiming(scene === 'after' ? 1 : 0, {
      duration: 750,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [scene, morph]);

  const emptyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [1, 0]),
  }));

  const packedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 1]),
  }));

  const nightWash = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 1]),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        {/* Soft mist ground */}
        <View style={styles.mist} />

        {/* Night sky wash */}
        <Animated.View style={[styles.nightSky, nightWash]} />

        {/* Building */}
        <View style={styles.building}>
          <View style={styles.roof} />
          <View style={styles.facade}>
            <View style={styles.windowSlot}>
              <Animated.View style={[styles.windowFill, emptyStyle]}>
                <View style={styles.windowPaneDim} />
              </Animated.View>
              <Animated.View style={[styles.windowFill, packedStyle]}>
                <View style={styles.windowPaneLit} />
              </Animated.View>
            </View>
            <View style={styles.windowSlot}>
              <Animated.View style={[styles.windowFill, emptyStyle]}>
                <View style={styles.windowPaneDim} />
              </Animated.View>
              <Animated.View style={[styles.windowFill, packedStyle]}>
                <View style={styles.windowPaneLit} />
              </Animated.View>
            </View>
            <View style={styles.door}>
              <Animated.View style={[styles.doorGlass, emptyStyle]} />
              <Animated.View style={[styles.doorGlassLit, packedStyle]} />
            </View>
          </View>
          <View style={styles.sign}>
            <View style={styles.signBar} />
          </View>
        </View>

        {/* Patio tables — empty */}
        <Animated.View style={[styles.patio, emptyStyle]}>
          <Table x={28} />
          <Table x={88} />
          <Table x={148} />
        </Animated.View>

        {/* Patio — packed people + glow */}
        <Animated.View style={[styles.patio, packedStyle]}>
          <View style={styles.groundGlow} />
          <Table x={28} filled />
          <Table x={88} filled />
          <Table x={148} filled />
          <Queue />
        </Animated.View>

        <View style={styles.toggleOverlay}>
          <SceneToggle
            value={scene}
            onChange={onChange}
            left="Empty"
            right="Packed"
            leftSub="quiet"
            rightSub="line out the door"
          />
        </View>
      </View>
    </View>
  );
}

function Table({ x, filled = false }) {
  return (
    <View style={[styles.tableWrap, { left: x }]}>
      <View style={[styles.chair, styles.chairL, filled && styles.chairFilled]} />
      <View style={[styles.tableTop, filled && styles.tableTopFilled]} />
      <View style={[styles.chair, styles.chairR, filled && styles.chairFilled]} />
      {filled ? (
        <>
          <View style={[styles.person, styles.personL]} />
          <View style={[styles.person, styles.personR]} />
        </>
      ) : null}
    </View>
  );
}

function Queue() {
  return (
    <View style={styles.queue}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.queuePerson, { left: i * 14, height: 28 + (i % 2) * 4 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  frame: {
    width: '100%',
    height: FRAME_H,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#e8ebe8',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eef1ee',
  },
  nightSky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0c1218',
  },
  building: {
    position: 'absolute',
    alignSelf: 'center',
    left: '18%',
    right: '18%',
    bottom: 92,
    height: FRAME_H * 0.48,
  },
  roof: {
    height: 14,
    backgroundColor: '#1a1f24',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  facade: {
    flex: 1,
    backgroundColor: '#2a3138',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  sign: {
    position: 'absolute',
    top: 22,
    alignSelf: 'center',
    left: '30%',
    right: '30%',
    alignItems: 'center',
  },
  signBar: {
    width: '70%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3d4650',
  },
  windowSlot: {
    width: '22%',
    height: '58%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  windowFill: {
    ...StyleSheet.absoluteFillObject,
  },
  windowPaneDim: {
    flex: 1,
    backgroundColor: '#1a2229',
  },
  windowPaneLit: {
    flex: 1,
    backgroundColor: '#f0c56a',
  },
  door: {
    width: '18%',
    height: '72%',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1a1f24',
  },
  doorGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#24303a',
  },
  doorGlassLit: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffe08a',
  },
  patio: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70,
    height: 70,
  },
  groundGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: 0,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(255,180,70,0.18)',
  },
  tableWrap: {
    position: 'absolute',
    bottom: 8,
    width: 44,
    height: 40,
    alignItems: 'center',
  },
  tableTop: {
    width: 28,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#9aa3ab',
    zIndex: 2,
    marginTop: 14,
  },
  tableTopFilled: {
    backgroundColor: '#c4a574',
  },
  chair: {
    position: 'absolute',
    top: 18,
    width: 12,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#8b949c',
  },
  chairL: { left: 0 },
  chairR: { right: 0 },
  chairFilled: { backgroundColor: '#6b5344' },
  person: {
    position: 'absolute',
    top: 2,
    width: 10,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#1a1f24',
  },
  personL: { left: 2 },
  personR: { right: 2 },
  queue: {
    position: 'absolute',
    right: '22%',
    bottom: 6,
    width: 80,
    height: 36,
  },
  queuePerson: {
    position: 'absolute',
    bottom: 0,
    width: 11,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#11161c',
  },
  toggleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
});
