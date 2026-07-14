import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { BusinessMotionBackdrop } from '../components/BusinessMotionBackdrop';
import { ConnectBusinessButton } from '../components/ConnectBusinessButton';
import { LegalLinks } from '../components/LegalLinks';
import { useReviews } from '../context/ReviewsContext';

const C = {
  ink: '#faf7f2',
  muted: 'rgba(250,247,242,0.7)',
  dim: 'rgba(250,247,242,0.4)',
  amber: '#ffb020',
  danger: '#ff4d5e',
  glass: 'rgba(12,12,14,0.72)',
  line: 'rgba(255,255,255,0.14)',
};

/**
 * Connect screen — booming restaurant photo marquees, centered UI (no clip),
 * shock entrance, floating review hits.
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();

  const enter = useSharedValue(0);
  const punch = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    punch.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 480, easing: Easing.in(Easing.cubic) })
    );
    enter.value = withDelay(
      200,
      withSpring(1, { damping: 14, stiffness: 90 })
    );
    float.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [enter, punch, float]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: punch.value * 0.85,
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        translateY: interpolate(enter.value, [0, 1], [40, 0], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(enter.value, [0, 1], [0.92, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const cardLeftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.35, 1], [0, 1]),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -12]) },
      { translateX: interpolate(float.value, [0, 1], [0, 6]) },
      { rotate: `${interpolate(float.value, [0, 1], [-3, 1])}deg` },
    ],
  }));

  const cardRightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.45, 1], [0, 1]),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, 10]) },
      { translateX: interpolate(float.value, [0, 1], [0, -5]) },
      { rotate: `${interpolate(float.value, [0, 1], [2.5, -1])}deg` },
    ],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <BusinessMotionBackdrop />

      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.stage}>
          <Animated.View style={[styles.card, styles.cardLeft, cardLeftStyle]}>
            <Text style={styles.badgeHot}>1★ URGENT</Text>
            <Text style={styles.cardQuote}>
              “Waited 40 min. Food arrived cold.”
            </Text>
            <Text style={styles.cardMeta}>Alex M. · Google</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardRight, cardRightStyle]}>
            <Text style={styles.badgeWin}>5★ BOOMING</Text>
            <Text style={styles.cardQuote}>
              “Best patio brunch in town.”
            </Text>
            <Text style={styles.cardMeta}>Maya R. · Google</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.eyebrow}>RESTAURANTS · CAFES · LOCAL LEGENDS</Text>
          <Text style={styles.brand} numberOfLines={1} adjustsFontSizeToFit>
            Trusty
          </Text>
          <Text style={styles.headline}>
            The review inbox for{'\n'}
            <Text style={styles.headlineAccent}>booming businesses.</Text>
          </Text>
          <Text style={styles.copy}>
            Catch every Google review in one place. Reply faster. Turn praise into
            posts. Protect the nights that pack the house.
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
    backgroundColor: '#050505',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff4e5',
    zIndex: 20,
  },
  safe: {
    flex: 1,
    // Keep all copy inset — fixes left-edge “rusty” clipping
    paddingHorizontal: 28,
  },
  stage: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '46%',
    maxWidth: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.glass,
    padding: 12,
  },
  cardLeft: {
    left: 0,
    top: '18%',
  },
  cardRight: {
    right: 0,
    top: '38%',
  },
  badgeHot: {
    color: C.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  badgeWin: {
    color: C.amber,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardQuote: {
    color: C.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  cardMeta: {
    marginTop: 8,
    color: C.dim,
    fontSize: 11,
  },
  hero: {
    paddingBottom: 20,
  },
  eyebrow: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  brand: {
    color: C.ink,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1.4,
    // Extra inset so first glyph never clips (was showing “rusty”)
    paddingLeft: 2,
    paddingRight: 8,
    includeFontPadding: false,
    marginBottom: 10,
  },
  headline: {
    color: C.ink,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 12,
  },
  headlineAccent: {
    color: C.amber,
  },
  copy: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
    maxWidth: 440,
  },
  hint: {
    marginTop: 14,
    color: C.dim,
    fontSize: 12,
    textAlign: 'center',
  },
  legal: {
    marginTop: 16,
  },
});
