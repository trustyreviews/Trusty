import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { firstNameFromAuthor, trimQuote } from '../utils/shareGraphic';

const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

function StarRow({ rating }) {
  const full = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <Text style={styles.stars} accessibilityLabel={`${full} out of 5 stars`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </Text>
  );
}

/**
 * Full-resolution share card (1080 square or 1080×1920 story).
 * Capture with react-native-view-shot; scale down for on-screen preview.
 */
export function ShareGraphicCard({
  review,
  businessName,
  format = 'square',
}) {
  const size = SIZES[format] || SIZES.square;
  const isStory = format === 'story';
  const quote = trimQuote(review?.text, isStory ? 160 : 120);
  const firstName = firstNameFromAuthor(review?.authorName);

  return (
    <View
      style={[
        styles.card,
        { width: size.width, height: size.height },
        isStory && styles.cardStory,
      ]}
      collapsable={false}
    >
      <View style={styles.glow} />
      <View style={[styles.inner, isStory && styles.innerStory]}>
        <StarRow rating={review?.rating} />
        <Text style={[styles.quote, isStory && styles.quoteStory]}>
          “{quote}”
        </Text>
        <Text style={styles.author}>— {firstName}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.business}>{businessName || 'Our business'}</Text>
        <Text style={styles.brand}>Trusty</Text>
      </View>
    </View>
  );
}

export const SHARE_GRAPHIC_SIZES = SIZES;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingHorizontal: 88,
    paddingTop: 100,
    paddingBottom: 72,
  },
  cardStory: {
    paddingTop: 220,
    paddingBottom: 120,
  },
  glow: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 520,
    height: 420,
    borderRadius: 260,
    backgroundColor: colors.accentSoft,
    opacity: 0.9,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  innerStory: {
    paddingBottom: 80,
  },
  stars: {
    fontSize: 52,
    letterSpacing: 10,
    color: colors.star,
  },
  quote: {
    fontFamily: fonts.display,
    fontSize: 54,
    lineHeight: 72,
    letterSpacing: -0.8,
    color: colors.text,
  },
  quoteStory: {
    fontSize: 58,
    lineHeight: 78,
  },
  author: {
    fontFamily: fonts.sansMedium,
    fontSize: 36,
    color: colors.textMuted,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingTop: 36,
  },
  business: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 34,
    color: colors.text,
    flex: 1,
    paddingRight: 24,
  },
  brand: {
    fontFamily: fonts.sans,
    fontSize: 26,
    color: colors.accent,
  },
});
