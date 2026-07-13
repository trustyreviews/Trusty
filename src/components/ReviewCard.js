import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StarRating } from './StarRating';
import { colors, fonts } from '../theme';

const ACTION_WIDTH = 92;

function formatRelativeDate(iso) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Subtle reveal: actions fade + settle in as the swipe progresses, rather than
// snapping straight to full opacity — matches the calm, unhurried feel of the list.
function SwipeAction({ progress, label, tone, onPress }) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = Math.min(progress.value, 1);
    return {
      opacity: p,
      transform: [{ scale: 0.85 + p * 0.15 }],
    };
  });

  return (
    <View style={[styles.actionPane, tone === 'accent' ? styles.actionAccent : styles.actionNeutral]}>
      <Pressable style={styles.actionPressable} onPress={onPress} hitSlop={4}>
        <Animated.Text
          style={[
            styles.actionLabel,
            tone === 'accent' ? styles.actionLabelAccent : styles.actionLabelNeutral,
            animatedStyle,
          ]}
        >
          {label}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

export function ReviewCard({ review, onPress, onReply, onToggleRead, onSwipeWillOpen }) {
  // Single urgency signal: a quiet left-edge accent. No badges, no color-shifted
  // backgrounds, no colored text — everything else stays on the calm base palette.
  const isNegative = review.rating <= 2;
  const unread = !review.read;
  const swipeableRef = useRef(null);

  const handleReply = () => {
    swipeableRef.current?.close();
    onReply();
  };

  const handleToggleRead = () => {
    swipeableRef.current?.close();
    onToggleRead();
  };

  return (
    <View style={styles.wrapper}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        leftThreshold={ACTION_WIDTH / 2}
        rightThreshold={ACTION_WIDTH / 2}
        overshootFriction={8}
        onSwipeableWillOpen={() => onSwipeWillOpen?.(swipeableRef)}
        renderLeftActions={(progress) => (
          <SwipeAction
            progress={progress}
            label={unread ? 'Mark read' : 'Mark unread'}
            tone="neutral"
            onPress={handleToggleRead}
          />
        )}
        renderRightActions={(progress) => (
          <SwipeAction
            progress={progress}
            label="Reply"
            tone="accent"
            onPress={handleReply}
          />
        )}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.card,
            isNegative && styles.cardNegative,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.header}>
            <View style={styles.authorRow}>
              <Text style={styles.author} numberOfLines={1}>
                {review.authorName}
              </Text>
              {unread ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.date}>{formatRelativeDate(review.date)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <StarRating rating={review.rating} />
          </View>

          <Text style={styles.body} numberOfLines={3}>
            {review.text}
          </Text>

          <Text style={[styles.status, review.replied && styles.statusReplied]}>
            {review.replied ? 'Replied' : 'Tap to reply'}
          </Text>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  cardNegative: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  author: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.sansSemiBold,
    flexShrink: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.unread,
  },
  date: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sans,
  },
  ratingRow: {
    marginBottom: 14,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 18,
    fontFamily: fonts.sans,
  },
  status: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
  },
  statusReplied: {
    color: colors.accent,
  },
  actionPane: {
    width: ACTION_WIDTH,
    height: '100%',
  },
  actionAccent: {
    backgroundColor: colors.accentSoft,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionNeutral: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  actionPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actionLabelAccent: {
    color: colors.accent,
  },
  actionLabelNeutral: {
    color: colors.unread,
  },
});
