import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FuturisticPatternBackdrop } from '../components/FuturisticPatternBackdrop';
import { HeroCta } from '../components/HeroCta';
import { LegalLinks } from '../components/LegalLinks';
import { RestaurantHeroScene } from '../components/RestaurantHeroScene';
import { useReviews } from '../context/ReviewsContext';

const C = {
  ink: '#f7f8f5',
  muted: 'rgba(247,248,245,0.68)',
  dim: 'rgba(247,248,245,0.4)',
  accent: '#2dd4bf',
  danger: '#fb7185',
};

/**
 * Connect — MotionSites Empty/Packed restaurant hero (real photo + lighting morph).
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();
  const [scene, setScene] = useState('before');
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(40, withSpring(1, { damping: 16, stiffness: 92 }));
  }, [enter]);

  useEffect(() => {
    const t = setTimeout(() => setScene('after'), 1700);
    return () => clearTimeout(t);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        translateY: interpolate(enter.value, [0, 1], [28, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const stageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 1], [0, 1]),
    transform: [
      {
        scale: interpolate(enter.value, [0, 1], [0.97, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const isAfter = scene === 'after';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FuturisticPatternBackdrop />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.stage, stageStyle]}>
          <RestaurantHeroScene scene={scene} onChange={setScene} />
        </Animated.View>

        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.eyebrow}>RESTAURANTS & LOCAL SPOTS</Text>
          <Text style={styles.brand} numberOfLines={1} adjustsFontSizeToFit>
            Trusty
          </Text>
          <Text style={styles.headline}>
            {isAfter ? (
              <>
                Stay on top of{'\n'}
                <Text style={styles.headlineAccent}>every guest review.</Text>
              </>
            ) : (
              <>
                Empty tables.{'\n'}
                <Text style={styles.headlineDanger}>Missed reviews.</Text>
              </>
            )}
          </Text>
          <Text style={styles.copy}>
            {isAfter
              ? 'Reply faster. Protect the nights that pack the house. One calm inbox for every Google review.'
              : 'When feedback sits unanswered, guests stop coming back. Flip to Packed to see the difference.'}
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
  safe: {
    flex: 1,
    paddingHorizontal: 22,
  },
  stage: {
    paddingTop: 8,
    marginBottom: 18,
  },
  hero: {
    paddingBottom: 12,
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
    fontSize: 48,
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
