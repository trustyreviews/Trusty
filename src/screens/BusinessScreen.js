import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegalLinks } from '../components/LegalLinks';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function BusinessScreen({ navigation }) {
  const { business, reviews, unreadNegativeCount } = useReviews();
  const styles = useThemedStyles(createStyles);

  if (!business) return null;

  const negativeCount = reviews.filter((r) => r.rating <= 2).length;
  const unrepliedCount = reviews.filter((r) => !r.replied).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Business</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{business.name}</Text>
        <Text style={styles.address}>{business.address}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={Math.round(business.averageRating)} size={18} />
          <Text style={styles.ratingText}>
            {business.averageRating.toFixed(1)} · {business.totalReviews} reviews
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>In inbox</Text>
        </View>
        <View style={[styles.stat, unreadNegativeCount > 0 && styles.statAlert]}>
          <Text
            style={[
              styles.statValue,
              unreadNegativeCount > 0 && styles.statValueAlert,
            ]}
          >
            {unreadNegativeCount}
          </Text>
          <Text style={styles.statLabel}>Unread negative</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{unrepliedCount}</Text>
          <Text style={styles.statLabel}>Unreplied</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{negativeCount}</Text>
          <Text style={styles.statLabel}>1–2 star</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Connected with mock Google Business Profile data. Real OAuth will replace
        this connection step later.
      </Text>

      <LegalLinks navigation={navigation} style={styles.legal} />
    </SafeAreaView>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontFamily: fonts.display,
      letterSpacing: -0.5,
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.surfaceAlt,
      marginBottom: 16,
    },
    name: {
      color: colors.text,
      fontSize: 22,
      fontFamily: fonts.sansBold,
      marginBottom: 6,
    },
    address: {
      color: colors.textMuted,
      fontSize: 15,
      marginBottom: 14,
      fontFamily: fonts.sans,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    ratingText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    stat: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.surfaceAlt,
    },
    statAlert: {
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    statValue: {
      color: colors.text,
      fontSize: 28,
      fontFamily: fonts.sansBold,
      marginBottom: 4,
    },
    statValueAlert: {
      color: colors.dangerText,
    },
    statLabel: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
    },
    note: {
      marginTop: 24,
      color: colors.textDim,
      fontSize: 13,
      lineHeight: 20,
      fontFamily: fonts.sans,
    },
    legal: {
      marginTop: 28,
    },
  };
}
