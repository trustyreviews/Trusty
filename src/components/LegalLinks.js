import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/**
 * Visible Website + Privacy Policy links (needed for Google OAuth verification).
 * Opens in-app screens so both are always reachable; hosted URLs live in company.js.
 */
export function LegalLinks({ navigation, style }) {
  return (
    <View style={[styles.row, style]}>
      <Pressable onPress={() => navigation?.navigate?.('About')} hitSlop={8}>
        <Text style={styles.link}>Website</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable onPress={() => navigation?.navigate?.('Privacy')} hitSlop={8}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  link: {
    color: colors.accent,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    textDecorationLine: 'underline',
  },
  dot: {
    color: colors.textDim,
    fontSize: 14,
    fontFamily: fonts.sans,
  },
});
