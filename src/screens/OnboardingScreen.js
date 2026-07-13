import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LegalLinks } from '../components/LegalLinks';
import { useReviews } from '../context/ReviewsContext';
import { colors, fonts } from '../theme';

export function OnboardingScreen({ navigation }) {
  const { connectBusiness } = useReviews();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.brand}>Trusty</Text>
      <Text style={styles.headline}>Stay on top of every Google review</Text>
      <Text style={styles.copy}>
        Connect your Google Business Profile to see new reviews, catch negative
        feedback early, and reply from one place.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        // TODO: Google OAuth entry point — replace connectBusiness() with AuthSession
        // against Google Business Profile, then fetch real locations + reviews.
        onPress={connectBusiness}
      >
        <Text style={styles.buttonText}>Connect your business</Text>
      </Pressable>

      <Text style={styles.hint}>
        Demo mode — loads sample Riverside Coffee Co. data
      </Text>

      <LegalLinks navigation={navigation} style={styles.legal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    color: colors.text,
    fontSize: 46,
    fontFamily: fonts.displayBold,
    letterSpacing: -1,
    marginBottom: 16,
  },
  headline: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.sansSemiBold,
    lineHeight: 30,
    marginBottom: 12,
  },
  copy: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 36,
    fontFamily: fonts.sans,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.sansBold,
  },
  hint: {
    marginTop: 16,
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: fonts.sans,
  },
  legal: {
    marginTop: 28,
  },
});
