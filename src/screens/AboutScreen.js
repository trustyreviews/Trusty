import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPANY } from '../config/company';
import { colors, fonts } from '../theme';

export function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>{COMPANY.name}</Text>
        <Text style={styles.tagline}>{COMPANY.tagline}</Text>
        <Text style={styles.body}>
          Trusty helps local businesses monitor Google Business Profile reviews,
          catch negative feedback early, and reply from one place. We only access
          the business data you authorize and never sell review content.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Company website</Text>
          <Pressable onPress={() => Linking.openURL(COMPANY.websiteUrl)}>
            <Text style={styles.link}>{COMPANY.websiteUrl}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Privacy Policy</Text>
          <Pressable onPress={() => Linking.openURL(COMPANY.privacyUrl)}>
            <Text style={styles.link}>{COMPANY.privacyUrl}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Contact</Text>
          <Pressable
            onPress={() => Linking.openURL(`mailto:${COMPANY.supportEmail}`)}
          >
            <Text style={styles.link}>{COMPANY.supportEmail}</Text>
          </Pressable>
        </View>
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
  brand: {
    color: colors.text,
    fontSize: 36,
    fontFamily: fonts.displayBold,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 17,
    marginBottom: 20,
    fontFamily: fonts.sans,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: fonts.sans,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    marginBottom: 12,
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  link: {
    color: colors.accent,
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
  },
});
