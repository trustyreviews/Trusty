import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StarRating } from './StarRating';
import { colors, fonts } from '../theme';
import {
  formatRelativeDate,
  getInitials,
  needsAction,
} from '../utils/reviewHelpers';

const ACTION_WIDTH = 96;

function ReplyAction({ progress, onPress }) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = Math.min(progress.value, 1);
    return {
      opacity: p,
      transform: [{ scale: 0.88 + p * 0.12 }],
    };
  });

  return (
    <View style={styles.actionPane}>
      <Pressable style={styles.actionPressable} onPress={onPress} hitSlop={4}>
        <Animated.View style={[styles.actionInner, animatedStyle]}>
          <Feather name="corner-up-left" size={18} color={colors.accent} />
          <Text style={styles.actionLabel}>Reply</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export function ReviewRow({
  review,
  businessName,
  expanded,
  draft,
  onChangeDraft,
  onStartReply,
  onCancelReply,
  onSend,
  onOptimize,
  optimizing,
  optimizeError,
  onSwipeWillOpen,
}) {
  const flagged = needsAction(review);
  const unread = !review.read;
  const swipeableRef = useRef(null);

  const openReply = () => {
    swipeableRef.current?.close();
    onStartReply?.();
  };

  const row = (
    <View style={[styles.row, flagged && styles.rowFlagged]}>
      {flagged ? <View style={styles.accent} /> : null}

      {/* Meta column */}
      <View style={styles.meta}>
        <View style={[styles.avatar, flagged && styles.avatarFlagged]}>
          <Text style={[styles.avatarText, flagged && styles.avatarTextFlagged]}>
            {getInitials(review.authorName)}
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {review.authorName}
          </Text>
          {unread ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.source}>{review.source}</Text>
        <Text style={[styles.time, flagged && styles.timeFlagged]}>
          {formatRelativeDate(review.date)}
          {flagged ? '  ·  Not Resolved' : ''}
        </Text>
      </View>

      {/* Content column */}
      <View style={styles.content}>
        <View style={styles.stars}>
          <StarRating rating={review.rating} size={15} />
        </View>
        <Text style={styles.body}>{review.text}</Text>

        {review.replied && !expanded ? (
          <View style={styles.postedReply}>
            <Text style={styles.postedLabel}>Replied</Text>
            <Text style={styles.postedText}>{review.replyText}</Text>
          </View>
        ) : null}

        {expanded ? (
          <View style={styles.editor}>
            <Text style={styles.editorLabel}>
              Drafting reply as {businessName}
            </Text>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={onChangeDraft}
              placeholder="Write a thoughtful reply…"
              placeholderTextColor={colors.textDim}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.editorFooter}>
              <View style={styles.aiWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.aiBtn,
                    (pressed || optimizing) && styles.pressedDim,
                  ]}
                  onPress={onOptimize}
                  disabled={optimizing || !draft.trim()}
                >
                  {optimizing ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Feather name="zap" size={13} color={colors.accent} />
                  )}
                  <Text style={styles.aiText}>
                    {optimizing ? 'Optimizing…' : 'Optimize with AI'}
                  </Text>
                </Pressable>
                {optimizeError ? (
                  <Text style={styles.aiError}>{optimizeError}</Text>
                ) : null}
              </View>

              <View style={styles.editorActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    pressed && styles.pressedDim,
                  ]}
                  onPress={onCancelReply}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.sendBtn,
                    !draft.trim() && styles.sendBtnDisabled,
                    pressed && draft.trim() && styles.sendBtnPressed,
                  ]}
                  disabled={!draft.trim()}
                  onPress={onSend}
                >
                  <Text style={styles.sendText}>Send Reply</Text>
                  <Feather name="arrow-right" size={14} color="#0b0c0e" />
                </Pressable>
              </View>
            </View>
          </View>
        ) : !review.replied ? (
          <Pressable
            style={({ pressed }) => [
              styles.replyAffordance,
              pressed && styles.pressedDim,
            ]}
            onPress={openReply}
          >
            <Feather name="corner-up-left" size={13} color={colors.textDim} />
            <Text style={styles.replyAffordanceText}>Tap to reply</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  // Once the inline editor is open, don't fight the TextInput with swipe gestures.
  if (expanded) {
    return row;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootFriction={8}
      onSwipeableWillOpen={() => onSwipeWillOpen?.(swipeableRef)}
      onSwipeableOpen={(direction) => {
        // Swiping left reveals the Reply action and opens the editor.
        if (direction === 'left') openReply();
      }}
      renderRightActions={(progress) => (
        <ReplyAction progress={progress} onPress={openReply} />
      )}
    >
      {row}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 26,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 20,
    backgroundColor: colors.bg,
  },
  rowFlagged: {
    borderBottomColor: colors.hairline,
  },
  accent: {
    position: 'absolute',
    left: -8,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.danger,
    borderRadius: 2,
  },
  actionPane: {
    width: ACTION_WIDTH,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
  },
  actionPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInner: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: fonts.sansSemiBold,
  },
  meta: {
    width: 150,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarFlagged: {
    backgroundColor: colors.dangerSoft,
  },
  avatarText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
  },
  avatarTextFlagged: {
    color: colors.dangerText,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.sansSemiBold,
    flexShrink: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.unread,
  },
  source: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sans,
    marginTop: 2,
  },
  time: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fonts.sans,
    marginTop: 10,
  },
  timeFlagged: {
    color: colors.dangerText,
  },
  content: {
    flex: 1,
  },
  stars: {
    marginBottom: 12,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.sans,
  },
  replyAffordance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
  },
  replyAffordanceText: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
  },
  pressedDim: {
    opacity: 0.6,
  },
  postedReply: {
    marginTop: 16,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: colors.accentSoft,
  },
  postedLabel: {
    color: colors.accent,
    fontSize: 11,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  postedText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.sans,
  },
  editor: {
    marginTop: 18,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
  },
  editorLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontFamily: fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.sans,
    minHeight: 84,
    marginBottom: 16,
  },
  editorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  aiWrap: {
    flexShrink: 1,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
  },
  aiText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
  },
  aiError: {
    color: colors.dangerText,
    fontSize: 12,
    fontFamily: fonts.sans,
    marginTop: 4,
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.sansMedium,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
  sendText: {
    color: '#0b0c0e',
    fontSize: 14,
    fontFamily: fonts.sansBold,
  },
});
