import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
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
import { FuturisticPatternBackdrop } from '../components/FuturisticPatternBackdrop';
import { HelpingLoop } from '../components/HelpingLoop';
import { HeroCta } from '../components/HeroCta';
import { LegalLinks } from '../components/LegalLinks';
import { SceneToggle } from '../components/SceneToggle';
import { useReviews } from '../context/ReviewsContext';

const RESTAURANT = require('../../assets/restaurant-thrive.png');
const { width: W } = Dimensions.get('window');

const C = {
  ink: '#f7f8f5',
  muted: 'rgba(247,248,245,0.68)',
  dim: 'rgba(247,248,245,0.4)',
  accent: '#2dd4bf',
  danger: '#fb7185',
  glass: 'rgba(12,16,22,0.78)',
  line: 'rgba(255,255,255,0.12)',
};

function ChaosCard({ title, quote, meta, style }) {
  return (
    <View style={[styles.chaosCard, style]}>
      <Text style={styles.chaosBadge}>{title}</Text>
      <Text style={styles.chaosQuote}>{quote}</Text>
      <Text style={styles.chaosMeta}>{meta}</Text>
    </View>
  );
}

/**
 * Connect screen — keep loop + thrive graphic + teal motion field,
 * add MotionSites-style Before/After morph, replace fat CTA.
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();
  const [scene, setScene] = useState('before');

  const enter = useSharedValue(0);
  const float = useSharedValue(0);
  const morph = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      60,
      withSpring(1, { damping: 16, stiffness: 90 })
    );
    float.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [enter, float]);

  useEffect(() => {
    morph.value = withTiming(scene === 'after' ? 1 : 0, {
      duration: 700,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [scene, morph]);

  // Auto-demo the morph once, MotionSites preview vibe
  useEffect(() => {
    const t1 = setTimeout(() => setScene('after'), 1600);
    return () => clearTimeout(t1);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        translateY: interpolate(enter.value, [0, 1], [32, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const stageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.05, 1], [0, 1]),
    transform: [
      {
        scale: interpolate(enter.value, [0, 1], [0.96, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const beforeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [1, 0]),
    transform: [
      { scale: interpolate(morph.value, [0, 1], [1, 0.94]) },
      { translateY: interpolate(morph.value, [0, 1], [0, 12]) },
    ],
  }));

  const afterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(morph.value, [0, 1], [1.06, 1]) },
      { translateY: interpolate(morph.value, [0, 1], [16, 0]) },
    ],
  }));

  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -8]) },
      { rotate: `${interpolate(float.value, [0, 1], [-1.2, 1])}deg` },
    ],
  }));

  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0.22, 0]),
  }));

  const loopSize = Math.min(W * 0.56, 228);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FuturisticPatternBackdrop />
      <Animated.View pointerEvents="none" style={[styles.chaosTint, tintStyle]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.stage, stageStyle]}>
          <View style={styles.stageFrame}>
            <Animated.View
              pointerEvents={scene === 'before' ? 'auto' : 'none'}
              style={[styles.layer, beforeStyle]}
            >
              <ChaosCard
                title="1★ · unanswered 2d"
                quote="“Waited 40 min. Food arrived cold.”"
                meta="Alex M. · Google"
                style={styles.cardA}
              />
              <ChaosCard
                title="2★ · spreading"
                quote="“Nobody checked on our table.”"
                meta="Sam K. · Google"
                style={styles.cardB}
              />
              <ChaosCard
                title="Inbox · 7 unread"
                quote="Reviews stacking. No replies yet."
                meta="Without Trusty"
                style={styles.cardC}
              />
            </Animated.View>

            <Animated.View
              pointerEvents={scene === 'after' ? 'auto' : 'none'}
              style={[styles.layer, styles.afterLayer, afterStyle]}
            >
              <Animated.View style={[styles.artWrap, artStyle]}>
                <Image
                  source={RESTAURANT}
                  style={styles.art}
                  resizeMode="cover"
                  accessibilityLabel="Thriving restaurant graphic"
                />
                <View style={styles.artBadge}>
                  <Text style={styles.artBadgeText}>Nights packing out</Text>
                </View>
              </Animated.View>
              <HelpingLoop size={loopSize} />
            </Animated.View>
          </View>

          <View style={styles.toggleWrap}>
            <SceneToggle value={scene} onChange={setScene} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.eyebrow}>RESTAURANTS & LOCAL SPOTS</Text>
          <Text style={styles.brand} numberOfLines={1} adjustsFontSizeToFit>
            Trusty
          </Text>
          <Text style={styles.headline}>
            {scene === 'before' ? (
              <>
                Missed reviews{'\n'}
                <Text style={styles.headlineDanger}>cost you nights.</Text>
              </>
            ) : (
              <>
                Stay on top of{'\n'}
                <Text style={styles.headlineAccent}>every guest review.</Text>
              </>
            )}
          </Text>
          <Text style={styles.copy}>
            {scene === 'before'
              ? 'Urgent feedback piles up. Guests leave. The story spreads before you ever see it.'
              : 'Guests speak. You reply. Trusty keeps the loop moving — so your restaurant keeps growing.'}
          </Text>

          <HeroCta label="Try the demo" onPress={connectBusiness} />

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
    backgroundColor: '#07090d',
  },
  chaosTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251,113,133,0.18)',
    zIndex: 0,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stage: {
    flex: 1,
    minHeight: 220,
    justifyContent: 'center',
  },
  stageFrame: {
    height: Math.min(W * 0.72, 280),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  afterLayer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chaosCard: {
    position: 'absolute',
    width: Math.min(W * 0.7, 260),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.glass,
    padding: 12,
  },
  cardA: {
    top: '8%',
    left: '4%',
    transform: [{ rotate: '-4deg' }],
  },
  cardB: {
    top: '34%',
    right: '2%',
    transform: [{ rotate: '3deg' }],
  },
  cardC: {
    bottom: '6%',
    left: '12%',
    transform: [{ rotate: '-1.5deg' }],
  },
  chaosBadge: {
    color: C.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  chaosQuote: {
    color: C.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  chaosMeta: {
    marginTop: 8,
    color: C.dim,
    fontSize: 11,
  },
  artWrap: {
    width: Math.min(W * 0.32, 140),
    height: Math.min(W * 0.32, 140),
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.glass,
  },
  art: {
    width: '100%',
    height: '100%',
  },
  artBadge: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(7,9,13,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.4)',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  artBadgeText: {
    color: C.accent,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  toggleWrap: {
    marginTop: 10,
    marginBottom: 4,
  },
  hero: {
    paddingBottom: 14,
  },
  eyebrow: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  brand: {
    color: C.ink,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.2,
    paddingLeft: 2,
    paddingRight: 8,
    includeFontPadding: false,
    marginBottom: 8,
  },
  headline: {
    color: C.ink,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 10,
  },
  headlineAccent: {
    color: C.accent,
  },
  headlineDanger: {
    color: C.danger,
  },
  copy: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 440,
  },
  hint: {
    marginTop: 14,
    color: C.dim,
    fontSize: 12,
  },
  legal: {
    marginTop: 12,
  },
});
