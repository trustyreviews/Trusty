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
import { useDemo } from '../context/DemoContext';

const C = {
  ink: '#f7f8f5',
  muted: 'rgba(247,248,245,0.68)',
  dim: 'rgba(247,248,245,0.4)',
  accent: '#2dd4bf',
};

const BEATS = ['Inbox', 'AI reply', 'Analytics'];

/**
 * Connect — large auto Empty/Packed restaurant graphic + Trusty CTA.
 */
export function OnboardingScreen({ navigation }) {
  const { startDemo } = useDemo();
  const [scene, setScene] = useState('before');
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(40, withSpring(1, { damping: 16, stiffness: 92 }));
  }, [enter]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {
        translateY: interpolate(enter.value, [0, 1], [20, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const stageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 1], [0, 1]),
  }));

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
            Stay on top of{' '}
            <Text style={styles.headlineAccent}>every guest review.</Text>
          </Text>
          <Text style={styles.copy}>
            Catch feedback early. Reply from one place. Keep the nights that pack
            the house.
          </Text>

          <View style={styles.beats}>
            <Text style={styles.beatsLabel}>What you’ll try</Text>
            <View style={styles.beatsRow}>
              {BEATS.map((beat, index) => (
                <View key={beat} style={styles.beatItem}>
                  {index > 0 ? <Text style={styles.beatArrow}>→</Text> : null}
                  <Text style={styles.beatText}>{beat}</Text>
                </View>
              ))}
            </View>
          </View>

          <HeroCta label="Try the demo" onPress={startDemo} />

          <Text style={styles.hint}>
            2-minute walkthrough — sample Riverside Coffee Co. data
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
    paddingHorizontal: 18,
  },
  stage: {
    flex: 1.15,
    minHeight: 320,
    paddingTop: 4,
    marginBottom: 12,
  },
  hero: {
    paddingBottom: 8,
  },
  eyebrow: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  brand: {
    color: C.ink,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.1,
    paddingLeft: 2,
    paddingRight: 8,
    includeFontPadding: false,
    marginBottom: 6,
  },
  headline: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 8,
  },
  headlineAccent: {
    color: C.accent,
  },
  copy: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
    maxWidth: 440,
  },
  beats: {
    marginBottom: 16,
    gap: 6,
  },
  beatsLabel: {
    color: C.dim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  beatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  beatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beatArrow: {
    color: C.dim,
    marginHorizontal: 8,
    fontSize: 13,
  },
  beatText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    color: C.dim,
    fontSize: 12,
  },
  legal: {
    marginTop: 10,
  },
});
