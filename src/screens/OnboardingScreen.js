import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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
import { ConnectBusinessButton } from '../components/ConnectBusinessButton';
import { FuturisticPatternBackdrop } from '../components/FuturisticPatternBackdrop';
import { HelpingLoop } from '../components/HelpingLoop';
import { LegalLinks } from '../components/LegalLinks';
import { useReviews } from '../context/ReviewsContext';

const RESTAURANT = require('../../assets/restaurant-thrive.png');
const { width: W } = Dimensions.get('window');

const C = {
  ink: '#f7f8f5',
  muted: 'rgba(247,248,245,0.68)',
  dim: 'rgba(247,248,245,0.4)',
  accent: '#2dd4bf',
  glass: 'rgba(12,16,22,0.72)',
  line: 'rgba(255,255,255,0.12)',
};

/**
 * Connect screen — teal futuristic motion field, thriving restaurant graphic,
 * and a spinning “we help each other” loop. No photo marquees.
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();

  const enter = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      80,
      withSpring(1, { damping: 15, stiffness: 95 })
    );
    float.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [enter, float]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        translateY: interpolate(enter.value, [0, 1], [28, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const stageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.1, 1], [0, 1]),
    transform: [
      {
        scale: interpolate(enter.value, [0, 1], [0.94, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -8]) },
      { rotate: `${interpolate(float.value, [0, 1], [-1.5, 1.2])}deg` },
    ],
  }));

  const loopSize = Math.min(W * 0.58, 240);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FuturisticPatternBackdrop />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.stage, stageStyle]}>
          <View style={styles.stageRow}>
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
          </View>
        </Animated.View>

        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.eyebrow}>RESTAURANTS & LOCAL SPOTS</Text>
          <Text style={styles.brand} numberOfLines={1} adjustsFontSizeToFit>
            Trusty
          </Text>
          <Text style={styles.headline}>
            Stay on top of{'\n'}
            <Text style={styles.headlineAccent}>every guest review.</Text>
          </Text>
          <Text style={styles.copy}>
            Guests speak. You reply. Trusty keeps the loop moving — so your
            restaurant keeps growing.
          </Text>

          <ConnectBusinessButton
            label="Connect your business"
            onPress={connectBusiness}
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
    backgroundColor: '#07090d',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stage: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  artWrap: {
    width: Math.min(W * 0.34, 150),
    height: Math.min(W * 0.34, 150),
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
  hero: {
    paddingBottom: 16,
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
  copy: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 440,
  },
  hint: {
    marginTop: 14,
    color: C.dim,
    fontSize: 12,
    textAlign: 'center',
  },
  legal: {
    marginTop: 14,
  },
});
