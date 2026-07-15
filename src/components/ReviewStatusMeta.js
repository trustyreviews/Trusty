import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { formatRelativeDate, getReviewStatus } from '../utils/reviewHelpers';

/**
 * Right-aligned status + date, matching Inbox chip language.
 */
export function ReviewStatusMeta({ review }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const status = getReviewStatus(review);
  const when = formatRelativeDate(review.date);

  if (status === 'replied') {
    return (
      <View style={styles.row}>
        <Feather name="check-circle" size={14} color="#4ade80" />
        <Text style={styles.replied}>Replied</Text>
        <Text style={styles.when}>{when}</Text>
      </View>
    );
  }

  if (status === 'resolved') {
    return (
      <View style={styles.row}>
        <Feather name="check-circle" size={14} color="#4ade80" />
        <Text style={styles.resolved}>Resolved</Text>
        <Text style={styles.when}>{when}</Text>
      </View>
    );
  }

  if (status === 'not_resolved') {
    return (
      <View style={styles.row}>
        <View style={[styles.pill, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.pillText, { color: colors.dangerText }]}>
            Not Resolved
          </Text>
        </View>
        <Text style={styles.when}>{when}</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.pillPending}>
        <Text style={styles.pillPendingText}>Pending</Text>
      </View>
      <Text style={styles.when}>{when}</Text>
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    replied: {
      color: '#4ade80',
      fontSize: 13,
      fontFamily: fonts.sansMedium,
    },
    resolved: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: fonts.sansMedium,
    },
    when: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sans,
    },
    pill: {
      paddingVertical: 3,
      paddingHorizontal: 9,
      borderRadius: 999,
    },
    pillText: {
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
    },
    pillPending: {
      paddingVertical: 3,
      paddingHorizontal: 9,
      borderRadius: 999,
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
    },
    pillPendingText: {
      color: '#fbbf24',
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
    },
  };
}
