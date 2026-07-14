import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectBusinessButton } from '../components/ConnectBusinessButton';
import { LegalLinks } from '../components/LegalLinks';
import { useReviews } from '../context/ReviewsContext';

const { width: W, height: H } = Dimensions.get('window');

/** Cinematic palette — not tied to app themes. */
const C = {
  bg: '#050505',
  ink: '#faf7f2',
  muted: 'rgba(250,247,242,0.62)',
  dim: 'rgba(250,247,242,0.38)',
  amber: '#ffb020',
  danger: '#ff3b4a',
  dangerSoft: 'rgba(255,59,74,0.18)',
  glass: 'rgba(255,255,255,0.07)',
  line: 'rgba(255,255,255,0.14)',
};

/**
 * Bold, unforgettable Connect screen:
 * slam type → star burst → review impact → settle to CTA.
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();

  const flash = useSharedValue(0);
  const slam = useSharedValue(0);
  const stars = useSharedValue(0);
  const impact = useSharedValue(0);
  const settle = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    // 1) White flash
    flash.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 520, easing: Easing.in(Easing.cubic) })
    );
    // 2) TRUSTY slam
    slam.value = withDelay(
      180,
      withSpring(1, { damping: 11, stiffness: 92, mass: 0.9 })
    );
    // 3) Stars
    stars.value = withDelay(
      780,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    // 4) Review impact
    impact.value = withDelay(
      1400,
      withSpring(1, { damping: 13, stiffness: 110 })
    );
    // 5) Bottom content
    settle.value = withDelay(
      1900,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    // Ambient drift
    drift.value = withDelay(
      2200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [flash, slam, stars, impact, settle, drift]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const slamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slam.value, [0, 0.2, 1], [0, 1, 1]),
    transform: [
      {
        scale: interpolate(slam.value, [0, 1], [2.6, 1], Extrapolation.CLAMP),
      },
      {
        translateY: interpolate(settle.value, [0, 1], [0, -H * 0.18]),
      },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stars.value, [0.3, 1], [0, 1]),
    transform: [
      { translateY: interpolate(stars.value, [0.3, 1], [20, 0]) },
      {
        translateY: interpolate(settle.value, [0, 1], [0, -H * 0.16]),
      },
    ],
  }));

  const starRowStyle = useAnimatedStyle(() => ({
    opacity: stars.value,
    transform: [
      { scale: interpolate(stars.value, [0, 1], [0.4, 1]) },
      {
        translateY: interpolate(settle.value, [0, 1], [0, -H * 0.14]),
      },
    ],
  }));

  const impactStyle = useAnimatedStyle(() => ({
    opacity: impact.value,
    transform: [
      {
        translateX: interpolate(impact.value, [0, 1], [-W * 0.7, 0]),
      },
      {
        rotate: `${interpolate(impact.value, [0, 1], [-12, -2])}deg`,
      },
      {
        scale: interpolate(impact.value, [0, 0.7, 1], [0.8, 1.08, 1]),
      },
      {
        translateY: interpolate(drift.value, [0, 1], [0, -8]),
      },
    ],
  }));

  const praiseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(impact.value, [0.4, 1], [0, 1]),
    transform: [
      {
        translateX: interpolate(impact.value, [0.4, 1], [W * 0.55, 0]),
      },
      {
        rotate: `${interpolate(impact.value, [0.4, 1], [10, 3])}deg`,
      },
      {
        translateY: interpolate(drift.value, [0, 1], [0, 10]),
      },
    ],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: settle.value,
    transform: [
      { translateY: interpolate(settle.value, [0, 1], [60, 0]) },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slam.value, [0.4, 1], [0, 0.55]),
    transform: [
      { scale: interpolate(slam.value, [0.4, 1], [0.6, 1.15]) },
      { rotate: `${interpolate(drift.value, [0, 1], [0, 25])}deg` },
    ],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#120a06', '#050505', '#0a1210']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Shock flash */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flash, flashStyle]}
      />

      {/* Ambient rings */}
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
      <View pointerEvents="none" style={styles.ringOuter} />

      {/* Giant slam title — stays on screen, lifts as UI settles */}
      <View pointerEvents="none" style={styles.slamWrap} accessibilityElementsHidden>
        <Animated.Text style={[styles.slam, slamStyle]} numberOfLines={1}>
          TRUSTY
        </Animated.Text>
        <Animated.View style={[styles.starRow, starRowStyle]}>
          {'★★★★★'.split('').map((s, i) => (
            <Text key={i} style={styles.star}>
              {s}
            </Text>
          ))}
        </Animated.View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Every review is a guest at your door.
        </Animated.Text>
      </View>

      {/* Impact review cards */}
      <Animated.View style={[styles.card, styles.cardBad, impactStyle]}>
        <View style={styles.cardAccentBad} />
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>Alex M.</Text>
          <Text style={styles.badgeBad}>1★ URGENT</Text>
        </View>
        <Text style={styles.cardBody}>
          Waited 40 minutes. Pasta arrived cold. Nobody checked on us.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardGood, praiseStyle]}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>Maya R.</Text>
          <Text style={styles.badgeGood}>5★</Text>
        </View>
        <Text style={styles.cardBody}>Best patio brunch in town.</Text>
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(5,5,5,0.75)', '#050505']}
          locations={[0, 0.35, 1]}
          style={styles.bottomFade}
        />
        <Animated.View style={[styles.bottom, bottomStyle]}>
          <Text style={styles.eyebrow}>CONNECT · DEMO READY</Text>
          <Text style={styles.headline}>
            Own every Google review{'\n'}before it owns you.
          </Text>
          <Text style={styles.copy}>
            Plug in Google Business Profile. Catch the hard ones first. Reply
            from one place.
          </Text>

          <ConnectBusinessButton
            label="Connect your business"
            onPress={connectBusiness}
            accentColor="#ffb020"
            labelColor="#140c02"
          />

          <Text style={styles.hint}>
            Demo mode — loads sample Riverside Coffee Co. data
          </Text>
          <LegalLinks navigation={navigation} style={styles.legal} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff8ef',
    zIndex: 50,
  },
  ring: {
    position: 'absolute',
    alignSelf: 'center',
    top: H * 0.12,
    width: Math.min(W * 1.1, 520),
    height: Math.min(W * 1.1, 520),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.28)',
  },
  ringOuter: {
    position: 'absolute',
    alignSelf: 'center',
    top: H * 0.06,
    width: Math.min(W * 1.35, 640),
    height: Math.min(W * 1.35, 640),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  slamWrap: {
    position: 'absolute',
    top: H * 0.22,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  slam: {
    color: C.ink,
    fontSize: Math.min(W * 0.22, 96),
    fontWeight: '900',
    letterSpacing: Math.min(W * 0.012, 6),
    textAlign: 'center',
    // Prevent first-glyph clipping from tight tracking / transforms
    paddingHorizontal: 8,
    includeFontPadding: false,
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  star: {
    color: C.amber,
    fontSize: 28,
  },
  tagline: {
    marginTop: 16,
    color: C.muted,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
    maxWidth: 320,
  },
  card: {
    position: 'absolute',
    zIndex: 3,
    width: Math.min(W - 48, 300),
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.glass,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  cardBad: {
    top: Math.min(H * 0.4, 340),
    left: 20,
  },
  cardGood: {
    top: Math.min(H * 0.34, 290),
    right: 16,
    width: Math.min(W * 0.42, 180),
  },
  cardAccentBad: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: C.danger,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardName: {
    color: C.ink,
    fontWeight: '700',
    fontSize: 14,
  },
  cardBody: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeBad: {
    color: C.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badgeGood: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '800',
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.min(H * 0.55, 420),
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  eyebrow: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  headline: {
    color: C.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 12,
    paddingRight: 8,
  },
  copy: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
    maxWidth: 420,
  },
  hint: {
    marginTop: 14,
    color: C.dim,
    fontSize: 12,
    textAlign: 'center',
  },
  legal: {
    marginTop: 18,
  },
});
