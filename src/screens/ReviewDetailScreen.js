import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StarRating } from '../components/StarRating';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function ReviewDetailScreen({ route, navigation }) {
  const { reviewId } = route.params;
  const { reviews, replyToReview } = useReviews();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const review = useMemo(
    () => reviews.find((r) => r.id === reviewId),
    [reviews, reviewId]
  );
  const [draft, setDraft] = useState(review?.replyText ?? '');

  if (!review) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Review not found.</Text>
      </View>
    );
  }

  const isNegative = review.rating <= 2;

  const handleSubmit = () => {
    replyToReview(review.id, draft);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {isNegative ? (
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>
              Negative review — prioritize a thoughtful reply
            </Text>
          </View>
        ) : null}

        <Text style={styles.author}>{review.authorName}</Text>
        <View style={styles.meta}>
          <StarRating rating={review.rating} size={18} />
          <Text style={styles.date}>
            {new Date(review.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        <Text style={styles.body}>{review.text}</Text>

        {review.replied && review.replyText ? (
          <View style={styles.existingReply}>
            <Text style={styles.existingLabel}>Your reply</Text>
            <Text style={styles.existingText}>{review.replyText}</Text>
          </View>
        ) : null}

        <Text style={styles.replyLabel}>
          {review.replied ? 'Update reply' : 'Write a reply'}
        </Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Thank the customer or address their concern…"
          placeholderTextColor={colors.textDim}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          style={({ pressed }) => [
            styles.submit,
            !draft.trim() && styles.submitDisabled,
            pressed && draft.trim() && styles.submitPressed,
          ]}
          disabled={!draft.trim()}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {review.replied ? 'Save reply' : 'Post reply'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    missing: {
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    missingText: {
      color: colors.textMuted,
      fontFamily: fonts.sans,
    },
    alertBanner: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerBorder,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    alertBannerText: {
      color: colors.dangerText,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    author: {
      color: colors.text,
      fontSize: 24,
      fontFamily: fonts.sansBold,
      marginBottom: 8,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    date: {
      color: colors.textDim,
      fontSize: 14,
      fontFamily: fonts.sans,
    },
    body: {
      color: colors.textMuted,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
      fontFamily: fonts.sans,
    },
    existingReply: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 14,
      marginBottom: 24,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    existingLabel: {
      color: colors.accent,
      fontSize: 12,
      fontFamily: fonts.sansBold,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    existingText: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      fontFamily: fonts.sans,
    },
    replyLabel: {
      color: colors.text,
      fontSize: 16,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 10,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceAlt,
      borderRadius: 12,
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
      minHeight: 140,
      padding: 14,
      marginBottom: 16,
      fontFamily: fonts.sans,
    },
    submit: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitDisabled: {
      opacity: 0.4,
    },
    submitPressed: {
      opacity: 0.9,
    },
    submitText: {
      color: colors.onAccent,
      fontSize: 16,
      fontFamily: fonts.sansBold,
    },
  };
}
