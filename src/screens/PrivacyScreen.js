import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPANY } from '../config/company';
import { PRIVACY_POLICY_TEXT } from '../content/privacyPolicy';
import { colors, fonts } from '../theme';

export function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.body}>{PRIVACY_POLICY_TEXT}</Text>
        <Pressable onPress={() => Linking.openURL(COMPANY.privacyUrl)}>
          <Text style={styles.external}>View on website →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontFamily: fonts.sansBold,
    marginBottom: 16,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.sans,
  },
  external: {
    marginTop: 24,
    color: colors.accent,
    fontSize: 15,
    fontFamily: fonts.sansSemiBold,
  },
});
