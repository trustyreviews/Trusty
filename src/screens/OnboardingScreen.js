import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConnectBusinessButton } from '../components/ConnectBusinessButton';
import { LegalLinks } from '../components/LegalLinks';
import { OnboardingBackground } from '../components/OnboardingBackground';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

/**
 * Connect-business screen — MotionSites-grade entrance:
 * staggered typography, floating glass review cards, premium CTA.
 */
export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();
  const { colors, themeId } = useTheme();
  const styles = useThemedStyles(createStyles);
  const statusBarStyle = themeId === 'daylight' ? 'dark' : 'light';

  const t = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    t.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [t, float]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.35], [0, 1]),
    transform: [
      { translateY: interpolate(t.value, [0, 0.45], [36, 0]) },
      { scale: interpolate(t.value, [0, 0.45], [0.94, 1]) },
    ],
  }));

  const line1Style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.12, 0.5], [0, 1]),
    transform: [{ translateY: interpolate(t.value, [0.12, 0.5], [28, 0]) }],
  }));

  const line2Style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.22, 0.6], [0, 1]),
    transform: [{ translateY: interpolate(t.value, [0.22, 0.6], [28, 0]) }],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.35, 0.75], [0, 1]),
    transform: [{ translateY: interpolate(t.value, [0.35, 0.75], [18, 0]) }],
  }));

  const metaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.55, 1], [0, 1]),
  }));

  const cardAStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.25, 0.65], [0, 1]),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -14]) },
      { translateX: interpolate(float.value, [0, 1], [0, 6]) },
      { rotate: `${interpolate(float.value, [0, 1], [-2, 1.5])}deg` },
    ],
  }));

  const cardBStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0.35, 0.75], [0, 0.95]),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, 12]) },
      { translateX: interpolate(float.value, [0, 1], [0, -8]) },
      { rotate: `${interpolate(float.value, [0, 1], [3, -1])}deg` },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(float.value, [0, 1], [0.35, 0.75]),
    transform: [{ scale: interpolate(float.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <View style={styles.container}>
      <OnboardingBackground />
      <StatusBar style={statusBarStyle} />

      {/* Floating glass review UI — separate from liquid-metal hero */}
      <View pointerEvents="none" style={styles.stage}>
        <Animated.View style={[styles.glass, styles.glassA, cardAStyle]}>
          <View style={styles.glassTop}>
            <Text style={styles.glassName}>Maya R.</Text>
            <View style={[styles.pill, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.pillText, { color: colors.accent }]}>5★</Text>
            </View>
          </View>
          <Text style={styles.glassBody}>“Best patio brunch in town.”</Text>
        </Animated.View>

        <Animated.View style={[styles.glass, styles.glassB, cardBStyle]}>
          <View style={styles.glassTop}>
            <Text style={styles.glassName}>Alex M.</Text>
            <View style={[styles.pill, { backgroundColor: colors.dangerSoft }]}>
              <Text style={[styles.pillText, { color: colors.dangerText }]}>
                1★ urgent
              </Text>
            </View>
          </View>
          <Text style={styles.glassBody}>“Waited 40 min. Food arrived cold.”</Text>
        </Animated.View>

        <Animated.View style={[styles.liveChip, pulseStyle]}>
          <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.liveText}>Live review inbox</Text>
        </Animated.View>
      </View>

      <View style={styles.content}>
        <Animated.Text style={[styles.eyebrow, brandStyle]}>
          FOR RESTAURANTS & LOCAL SPOTS
        </Animated.Text>

        <Animated.Text style={[styles.brand, brandStyle]}>Trusty</Animated.Text>

        <Animated.Text style={[styles.headline, line1Style]}>
          Stay on top of
        </Animated.Text>
        <Animated.Text style={[styles.headlineAccent, line2Style]}>
          every guest review.
        </Animated.Text>

        <Animated.Text style={[styles.copy, copyStyle]}>
          Connect Google Business Profile. Catch negative feedback early. Reply
          from one calm place.
        </Animated.Text>

        <ConnectBusinessButton
          // TODO: Google OAuth entry point — replace connectBusiness() with AuthSession
          // against Google Business Profile, then fetch real locations + reviews.
          onPress={connectBusiness}
        />

        <Animated.View style={metaStyle}>
          <Text style={styles.hint}>
            Demo mode — loads sample Riverside Coffee Co. data
          </Text>
          <LegalLinks navigation={navigation} style={styles.legal} />
        </Animated.View>
      </View>
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    stage: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },
    glass: {
      position: 'absolute',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 14,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 14 },
      elevation: 8,
      maxWidth: 260,
    },
    glassA: {
      top: '14%',
      right: 22,
    },
    glassB: {
      top: '22%',
      left: 24,
    },
    glassTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8,
    },
    glassName: {
      color: colors.text,
      fontFamily: fonts.sansSemiBold,
      fontSize: 14,
    },
    glassBody: {
      color: colors.textMuted,
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 19,
    },
    pill: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    pillText: {
      fontSize: 11,
      fontFamily: fonts.sansBold,
      letterSpacing: 0.2,
    },
    liveChip: {
      position: 'absolute',
      top: '42%',
      alignSelf: 'center',
      left: '28%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.panel,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    liveText: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 32,
      paddingBottom: 44,
      zIndex: 2,
      overflow: 'visible',
    },
    eyebrow: {
      color: colors.accent,
      fontSize: 11,
      fontFamily: fonts.sansBold,
      letterSpacing: 1.8,
      marginBottom: 14,
    },
    brand: {
      color: colors.text,
      fontSize: 52,
      fontFamily: fonts.displayBold,
      letterSpacing: -1.2,
      marginBottom: 14,
      paddingLeft: 2,
    },
    headline: {
      color: colors.text,
      fontSize: 28,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: -0.6,
      lineHeight: 34,
    },
    headlineAccent: {
      color: colors.accent,
      fontSize: 28,
      fontFamily: fonts.sansBold,
      letterSpacing: -0.6,
      lineHeight: 34,
      marginBottom: 14,
    },
    copy: {
      color: colors.textMuted,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 28,
      fontFamily: fonts.sans,
      maxWidth: 420,
    },
    hint: {
      marginTop: 16,
      color: colors.textDim,
      fontSize: 13,
      textAlign: 'center',
      fontFamily: fonts.sans,
    },
    legal: {
      marginTop: 22,
    },
  };
}