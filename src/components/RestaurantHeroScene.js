import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SceneToggle } from './SceneToggle';

const { width: W, height: H } = Dimensions.get('window');
const FRAME_H = Math.min(H * 0.48, Math.max(W * 0.95, 380));

/**
 * Big simple restaurant graphic — one hard cut Empty → Packed, then stays.
 */
export function RestaurantHeroScene({ scene, onChange }) {
  const morph = useSharedValue(scene === 'after' ? 1 : 0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    // Hard cut — no soft crossfade
    morph.value = scene === 'after' ? 1 : 0;
  }, [scene, morph]);

  // Auto Empty → Packed once, then stop
  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current('after');
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const emptyStyle = useAnimatedStyle(() => ({
    opacity: morph.value === 0 ? 1 : 0,
  }));

  const packedStyle = useAnimatedStyle(() => ({
    opacity: morph.value === 1 ? 1 : 0,
  }));

  const nightWash = useAnimatedStyle(() => ({
    opacity: morph.value,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        <View style={styles.mist} />
        <Animated.View style={[styles.nightSky, nightWash]} />

        <View style={styles.sidewalk} />
        <View style={styles.street} />

        {/* Empty street — quiet, maybe one distant parked car outline */}
        <Animated.View style={[styles.streetLayer, emptyStyle]} pointerEvents="none">
          <Car left="72%" color="#9aa3ab" dim />
        </Animated.View>

        {/* Packed street — cars with headlights */}
        <Animated.View style={[styles.streetLayer, packedStyle]} pointerEvents="none">
          <Car left="4%" color="#2dd4bf" lit />
          <Car left="28%" color="#c45c4a" lit />
          <Car left="52%" color="#f0c56a" lit />
          <Car left="74%" color="#4a6fa5" lit />
        </Animated.View>

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
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} guests />
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} wide guests />
            <Door emptyStyle={emptyStyle} packedStyle={packedStyle} />
            <Window emptyStyle={emptyStyle} packedStyle={packedStyle} guests />
          </View>

          <View style={styles.signBoard}>
            <Text style={styles.signText}>CAFE</Text>
          </View>

          <Animated.View style={[styles.openNeon, packedStyle]}>
            <Text style={styles.openText}>OPEN</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.patio, emptyStyle]} pointerEvents="none">
          <RoundTable x="8%" />
          <RoundTable x="32%" />
          <RoundTable x="56%" />
          <RoundTable x="78%" />
        </Animated.View>

        <Animated.View style={[styles.patio, packedStyle]} pointerEvents="none">
          <View style={styles.groundGlow} />
          {/* Front row — full tables */}
          <RoundTable x="1%" filled seats={4} />
          <RoundTable x="18%" filled seats={3} />
          <RoundTable x="35%" filled seats={4} />
          <RoundTable x="52%" filled seats={3} />
          <RoundTable x="68%" filled seats={4} />
          {/* Standing crowd between tables */}
          <CrowdRow y={8} count={14} start={4} step={7} />
          <CrowdRow y={22} count={12} start={10} step={7.5} taller />
          {/* Long line at the door */}
          <Queue />
          <CrowdSpill />
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

function Window({ emptyStyle, packedStyle, wide = false, guests = false }) {
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
          {guests ? (
            <>
              <View style={[styles.insideGuest, { left: '8%' }]} />
              <View style={[styles.insideGuest, { left: '28%' }]} />
              <View style={[styles.insideGuest, { right: '28%' }]} />
              <View style={[styles.insideGuest, { right: '8%' }]} />
              <View style={[styles.insideGuest, styles.insideGuestTall, { left: '48%' }]} />
            </>
          ) : null}
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

function RoundTable({ x, filled = false, seats = 2 }) {
  return (
    <View style={[styles.tableWrap, { left: x }]}>
      <View style={[styles.chair, styles.chairL, filled && styles.chairFilled]} />
      <View style={[styles.chair, styles.chairR, filled && styles.chairFilled]} />
      {seats >= 3 ? (
        <View style={[styles.chair, styles.chairBack, filled && styles.chairFilled]} />
      ) : null}
      {seats >= 4 ? (
        <View style={[styles.chair, styles.chairFront, filled && styles.chairFilled]} />
      ) : null}
      <View style={[styles.tableTop, filled && styles.tableTopFilled]} />
      {filled ? (
        <>
          <View style={[styles.person, styles.personL]} />
          <View style={[styles.person, styles.personR]} />
          {seats >= 3 ? <View style={[styles.person, styles.personBack]} /> : null}
          {seats >= 4 ? <View style={[styles.person, styles.personFront]} /> : null}
          <View style={styles.plate} />
        </>
      ) : null}
    </View>
  );
}

function CrowdRow({ y, count, start, step, taller = false }) {
  return (
    <View style={[styles.crowdRow, { bottom: y }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.crowdPerson,
            {
              left: `${start + i * step}%`,
              height: (taller ? 34 : 28) + (i % 5) * 2,
              width: taller ? 12 : 10,
              backgroundColor: i % 3 === 0 ? '#1a1f24' : i % 3 === 1 ? '#2a2220' : '#14181e',
            },
          ]}
        />
      ))}
    </View>
  );
}

function CrowdSpill() {
  // Extra dense cluster near the entrance
  return (
    <View style={styles.spill}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.spillPerson,
            {
              left: (i % 5) * 12,
              bottom: Math.floor(i / 5) * 10,
              height: 26 + (i % 4) * 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

function Queue() {
  return (
    <View style={styles.queue}>
      {Array.from({ length: 16 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.queuePerson,
            {
              left: i * 9,
              height: 26 + (i % 5) * 3,
              width: 10,
              backgroundColor: i % 2 === 0 ? '#11161c' : '#1c1816',
            },
          ]}
        />
      ))}
    </View>
  );
}

function Car({ left, color, lit = false, dim = false }) {
  return (
    <View style={[styles.car, { left }, dim && styles.carDim]}>
      <View style={[styles.carBody, { backgroundColor: color }]} />
      <View style={[styles.carCabin, { backgroundColor: lit ? '#ffe9a8' : '#5a6570' }]} />
      <View style={[styles.wheel, styles.wheelL]} />
      <View style={[styles.wheel, styles.wheelR]} />
      {lit ? (
        <>
          <View style={[styles.headlight, styles.headL]} />
          <View style={[styles.headlight, styles.headR]} />
          <View style={styles.headBeam} />
        </>
      ) : null}
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
    bottom: 78,
    height: 40,
    backgroundColor: '#c5cbc8',
  },
  street: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 52,
    height: 28,
    backgroundColor: '#3a4048',
  },
  streetLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 54,
    height: 36,
    zIndex: 3,
  },
  car: {
    position: 'absolute',
    bottom: 2,
    width: 54,
    height: 28,
  },
  carDim: {
    opacity: 0.45,
  },
  carBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    height: 12,
    borderRadius: 4,
  },
  carCabin: {
    position: 'absolute',
    left: 10,
    right: 14,
    bottom: 14,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  wheel: {
    position: 'absolute',
    bottom: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a1f24',
  },
  wheelL: { left: 8 },
  wheelR: { right: 8 },
  headlight: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff4c8',
  },
  headL: { left: 2 },
  headR: { left: 10 },
  headBeam: {
    position: 'absolute',
    left: -18,
    bottom: 6,
    width: 22,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,240,180,0.22)',
  },
  building: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 116,
    height: '52%',
    maxHeight: 240,
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
  insideGuest: {
    position: 'absolute',
    bottom: 14,
    width: 8,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(30,24,20,0.75)',
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
    bottom: 86,
    height: 100,
  },
  groundGlow: {
    position: 'absolute',
    left: '2%',
    right: '2%',
    bottom: 0,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,180,70,0.28)',
  },
  tableWrap: {
    position: 'absolute',
    bottom: 28,
    width: 48,
    height: 48,
    alignItems: 'center',
    zIndex: 2,
  },
  tableTop: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#9aa3ab',
    zIndex: 2,
    marginTop: 12,
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
    width: 11,
    height: 13,
    borderRadius: 3,
    backgroundColor: '#8b949c',
  },
  chairL: { left: 0 },
  chairR: { right: 0 },
  chairBack: { left: '36%', top: 4 },
  chairFront: { left: '36%', top: 34, zIndex: 5 },
  chairFilled: { backgroundColor: '#6b5344' },
  person: {
    position: 'absolute',
    top: 2,
    width: 10,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#1a1f24',
    zIndex: 3,
  },
  personL: { left: 1 },
  personR: { right: 1 },
  personBack: { left: '36%', top: -4 },
  personFront: { left: '36%', top: 28, zIndex: 6 },
  plate: {
    position: 'absolute',
    top: 18,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#f4f1ea',
    zIndex: 4,
  },
  crowdRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 42,
    zIndex: 4,
  },
  crowdPerson: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  spill: {
    position: 'absolute',
    right: '18%',
    bottom: 4,
    width: 70,
    height: 48,
    zIndex: 5,
  },
  spillPerson: {
    position: 'absolute',
    width: 11,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#16120f',
  },
  queue: {
    position: 'absolute',
    right: '2%',
    bottom: 2,
    width: 150,
    height: 44,
    zIndex: 6,
  },
  queuePerson: {
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  insideGuestTall: {
    height: 16,
    width: 8,
  },
  toggleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
});
