import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SceneToggle } from './SceneToggle';

const { width: W, height: H } = Dimensions.get('window');
const FRAME_H = Math.min(H * 0.48, Math.max(W * 0.95, 380));

/**
 * Big simple restaurant graphic — auto Empty → Packed loop.
 */
export function RestaurantHeroScene({ scene, onChange }) {
  const morph = useSharedValue(scene === 'after' ? 1 : 0);
  const userTouched = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    morph.value = withTiming(scene === 'after' ? 1 : 0, {
      duration: 900,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [scene, morph]);

  // Auto-cycle Empty → Packed → Empty unless user taps the toggle
  useEffect(() => {
    let cancelled = false;
    let timer;

    const tick = (next) => {
      if (cancelled || userTouched.current) return;
      onChangeRef.current(next);
      timer = setTimeout(() => tick(next === 'after' ? 'before' : 'after'), 3200);
    };

    timer = setTimeout(() => tick('after'), 1400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleChange = (next) => {
    userTouched.current = true;
    onChange(next);
  };

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
        <View style={styles.mist} />
        <Animated.View style={[styles.nightSky, nightWash]} />

        {/* Sidewalk */}
        <View style={styles.sidewalk} />

        {/* Building */}
        <View style={styles.building}>
          <View style={styles.awning}>
            <View style={[styles.stripe, { backgroundColor: '#c45c4a' }]} />
            <View style={[styles.stripe, { backgroundColor: '#f4f1ea' }]} />
            <View style={[styles.stripe, { backgroundColor: '#c45c4a' }]} />
            <View style={[styles.stripe, { backgroundColor: '#f4f1ea' }]} />
            <View style={[styles.stripe, { backgroundColor: '#c45c4a' }]} />
            <View style={[styles.stripe, { backgroundColor: '#f4f1ea' }]} />
          </View>

          <View style={styles.facade}>
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} />
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} wide />
            <Door emptyStyle={emptyStyle} packedStyle={packedStyle} />
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} />
          </View>

          {/* Simple cafe sign */}
          <View style={styles.signBoard}>
            <Text style={styles.signText}>CAFE</Text>
          </View>

          <Animated.View style={[styles.openNeon, packedStyle]}>
            <Text style={styles.openText}>OPEN</Text>
          </Animated.View>
        </View>

        {/* Empty patio */}
        <Animated.View style={[styles.patio, emptyStyle]}>
          <RoundTable x="12%" />
          <RoundTable x="38%" />
          <RoundTable x="64%" />
        </Animated.View>

        {/* Packed patio + line */}
        <Animated.View style={[styles.patio, packedStyle]}>
          <View style={styles.groundGlow} />
          <RoundTable x="12%" filled />
          <RoundTable x="38%" filled />
          <RoundTable x="64%" filled />
          <Queue />
        </Animated.View>

        <View style={styles.toggleOverlay}>
          <SceneToggle
            value={scene}
            onChange={handleChange}
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

function Window({ emptyStyle, packedStyle, wide = false }) {
  return (
    <View style={[styles.windowSlot, wide && styles.windowWide]}>
      <Animated.View style={[styles.windowFill, emptyStyle]}>
        <View style={styles.windowPaneDim}>
          <View style={styles.mullionV} />
          <View style={styles.mullionH} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.windowFill, packedStyle]}>
        <View style={styles.windowPaneLit}>
          <View style={[styles.mullionV, styles.mullionLit]} />
          <View style={[styles.mullionH, styles.mullionLit]} />
          <View style={styles.insideTable} />
        </View>
      </Animated.View>
    </View>
  );
}

function Door({ emptyStyle, packedStyle }) {
  return (
    <View style={styles.door}>
      <Animated.View style={[styles.doorGlass, emptyStyle]} />
      <Animated.View style={[styles.doorGlassLit, packedStyle]} />
      <View style={styles.doorHandle} />
    </View>
  );
}

function RoundTable({ x, filled = false }) {
  return (
    <View style={[styles.tableWrap, { left: x }]}>
      <View style={[styles.chair, styles.chairL, filled && styles.chairFilled]} />
      <View style={[styles.chair, styles.chairR, filled && styles.chairFilled]} />
      <View style={[styles.tableTop, filled && styles.tableTopFilled]} />
      {filled ? (
        <>
          <View style={[styles.person, styles.personL]} />
          <View style={[styles.person, styles.personR]} />
          <View style={styles.plate} />
        </>
      ) : null}
    </View>
  );
}

function Queue() {
  return (
    <View style={styles.queue}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.queuePerson,
            { left: i * 13, height: 30 + (i % 3) * 3 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flex: 1,
    minHeight: FRAME_H,
  },
  frame: {
    flex: 1,
    width: '100%',
    minHeight: FRAME_H,
    borderRadius: 32,
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
    backgroundColor: '#0b1219',
  },
  sidewalk: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 58,
    height: 52,
    backgroundColor: '#c5cbc8',
  },
  building: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 108,
    height: '58%',
    maxHeight: 260,
  },
  awning: {
    height: 28,
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    marginBottom: -2,
    zIndex: 2,
  },
  stripe: {
    flex: 1,
  },
  facade: {
    flex: 1,
    backgroundColor: '#3a2f2a',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  signBoard: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    left: '28%',
    right: '28%',
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1a1614',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  signText: {
    color: '#f4f1ea',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  openNeon: {
    position: 'absolute',
    top: 44,
    right: 18,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(45,212,191,0.15)',
    borderWidth: 1,
    borderColor: '#2dd4bf',
    zIndex: 4,
  },
  openText: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  windowSlot: {
    width: '18%',
    height: '62%',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2a221e',
  },
  windowWide: {
    width: '24%',
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
    backgroundColor: '#f2c66a',
  },
  mullionV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '48%',
    width: 2,
    backgroundColor: '#2a3138',
  },
  mullionH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 2,
    backgroundColor: '#2a3138',
  },
  mullionLit: {
    backgroundColor: 'rgba(90,60,20,0.35)',
  },
  insideTable: {
    position: 'absolute',
    bottom: 8,
    left: '20%',
    right: '20%',
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(80,50,20,0.35)',
  },
  door: {
    width: '16%',
    height: '78%',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2a221e',
  },
  doorGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#24303a',
  },
  doorGlassLit: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffe08a',
  },
  doorHandle: {
    position: 'absolute',
    right: 6,
    top: '48%',
    width: 4,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#c4a574',
  },
  patio: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 72,
    height: 78,
  },
  groundGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 0,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,180,70,0.2)',
  },
  tableWrap: {
    position: 'absolute',
    bottom: 10,
    width: 56,
    height: 48,
    alignItems: 'center',
  },
  tableTop: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#9aa3ab',
    zIndex: 2,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#7d868e',
  },
  tableTopFilled: {
    backgroundColor: '#c4a574',
    borderColor: '#9a7a4a',
  },
  chair: {
    position: 'absolute',
    top: 22,
    width: 14,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#8b949c',
  },
  chairL: { left: 0 },
  chairR: { right: 0 },
  chairFilled: { backgroundColor: '#6b5344' },
  person: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#1a1f24',
    zIndex: 3,
  },
  personL: { left: 4 },
  personR: { right: 4 },
  plate: {
    position: 'absolute',
    top: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f4f1ea',
    zIndex: 4,
  },
  queue: {
    position: 'absolute',
    right: '10%',
    bottom: 8,
    width: 90,
    height: 40,
  },
  queuePerson: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#11161c',
  },
  toggleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: 'center',
  },
});
