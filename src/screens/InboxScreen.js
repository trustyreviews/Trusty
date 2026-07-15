import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { optimizeReply } from '../api/optimizeReply';
import { DemoCoachTip } from '../components/DemoCoachTip';
import { InboxSortFilterSheet } from '../components/InboxSortFilterSheet';
import { ReviewRow } from '../components/ReviewRow';
import { StarRating } from '../components/StarRating';
import { StatusIconFilter } from '../components/StatusIconFilter';
import { ThemeColorSlider } from '../components/ThemeColorSlider';
import { useDemo } from '../context/DemoContext';
import { useInboxQuery } from '../context/InboxQueryContext';
import { useReviews } from '../context/ReviewsContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { applyInboxQuery } from '../utils/inboxQuery';
import { getReviewStatus, needsAction } from '../utils/reviewHelpers';

export function InboxScreen() {
  const {
    reviews,
    business,
    markRead,
    replyToReview,
    syncFacebookReviews,
    facebookConnected,
    syncingFacebook,
  } = useReviews();
  const {
    demoActive,
    focusReviewId,
    focusRequestId,
    tourStep,
    notifyOpenedFocus,
    notifyDraftedWithAi,
  } = useDemo();
  const { tone } = useSettings();
  const { query, applyQuery, resetQuery, isActive } = useInboxQuery();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const businessName = business?.name ?? 'Your business';

  const [filter, setFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const openSwipeableRef = useRef(null);
  const listRef = useRef(null);
  const autoFocusDoneRef = useRef(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const handleSwipeWillOpen = (swipeableRef) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== swipeableRef) {
      openSwipeableRef.current.current?.close();
    }
    openSwipeableRef.current = swipeableRef;
  };

  const counts = useMemo(
    () => ({
      all: reviews.length,
      replied: reviews.filter((r) => getReviewStatus(r) === 'replied').length,
      resolved: reviews.filter((r) => getReviewStatus(r) === 'resolved').length,
      not_resolved: reviews.filter((r) => getReviewStatus(r) === 'not_resolved')
        .length,
      pending: reviews.filter((r) => getReviewStatus(r) === 'pending').length,
      action: reviews.filter(needsAction).length,
    }),
    [reviews]
  );

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter !== 'all') {
      list = reviews.filter((r) => getReviewStatus(r) === filter);
    }
    // Advanced sort/filter is additive on top of the active status chip.
    return applyInboxQuery(list, query);
  }, [reviews, filter, query]);

  const scrollExpandedIntoView = (reviewId) => {
    const index = filtered.findIndex((r) => r.id === reviewId);
    if (index < 0) return;
    try {
      listRef.current?.scrollToIndex({
        index,
        // Keep the reply editor toward the upper half so it clears the keyboard.
        viewPosition: 0.15,
        animated: true,
      });
    } catch {
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          viewPosition: 0.15,
          animated: true,
        });
      }, 80);
    }
  };

  useEffect(() => {
    if (!expandedId) return;
    const timer = setTimeout(() => scrollExpandedIntoView(expandedId), 120);
    return () => clearTimeout(timer);
    // Re-scroll when the keyboard opens so the editor stays visible.
  }, [expandedId, keyboardHeight, filtered]);

  const startReply = (review) => {
    openSwipeableRef.current?.current?.close();
    openSwipeableRef.current = null;
    markRead(review.id);
    // Only AI or the user write replies — never prefill canned templates.
    setDraft(review.replyText || '');
    setOptimizeError(null);
    setExpandedId(review.id);
    if (demoActive && review.id === focusReviewId) {
      notifyOpenedFocus();
    }
  };

  // Scripted demo: scroll focus review into view when a session begins.
  useEffect(() => {
    if (!demoActive || !focusRequestId) return;
    if (autoFocusDoneRef.current === focusRequestId) return;
    const index = filtered.findIndex((r) => r.id === focusReviewId);
    if (index < 0) return;
    autoFocusDoneRef.current = focusRequestId;
    const timer = setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({
          index,
          viewPosition: 0.2,
          animated: true,
        });
      } catch {
        /* ignore */
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [demoActive, focusRequestId, focusReviewId, filtered]);

  const cancelReply = () => {
    setExpandedId(null);
    setDraft('');
    setOptimizeError(null);
  };

  const sendReply = async () => {
    if (!draft.trim() || !expandedId) return;
    setReplyError(null);
    try {
      await replyToReview(expandedId, draft);
      setExpandedId(null);
      setDraft('');
      setOptimizeError(null);
    } catch (error) {
      setReplyError(
        error?.message?.includes('Network request failed') ||
          error?.message?.includes('Failed to fetch')
          ? 'Can’t reach the API — check npm run api and EXPO_PUBLIC_API_BASE_URL'
          : error?.message || 'Failed to post reply'
      );
    }
  };

  const onRefresh = async () => {
    if (!facebookConnected) return;
    setRefreshing(true);
    try {
      await syncFacebookReviews();
    } catch {
      /* pull-to-refresh fails silently; use Settings to see connect errors */
    } finally {
      setRefreshing(false);
    }
  };

  const emptyMessage = useMemo(() => {
    if (isActive) return 'No reviews match these filters.';
    if (facebookConnected && !reviews.some((r) => r.source === 'Facebook')) {
      return 'No Facebook reviews on Trusty Inc. yet. Connect in Settings or pull down to refresh.';
    }
    return "Nothing here — you're all caught up.";
  }, [isActive, facebookConnected, reviews]);

  const optimize = async () => {
    const review = reviews.find((r) => r.id === expandedId);
    if (!review || optimizing) return;

    setOptimizing(true);
    setOptimizeError(null);
    try {
      const polished = await optimizeReply({
        reviewText: review.text,
        draftReply: draft,
        tone,
        businessName,
        rating: review.rating,
        authorName: review.authorName,
      });
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] InboxScreen.optimize: success, polished reply received', {
        polished,
      });
      setDraft(polished);
      if (demoActive && review.id === focusReviewId) {
        notifyDraftedWithAi();
      }
    } catch (error) {
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] InboxScreen.optimize: catch/error', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
        fullError: error,
      });
      setOptimizeError(
        error?.message?.includes('quota') || error?.message?.includes('aistudio')
          ? error.message
          : error?.message?.includes('busy')
            ? error.message
            : error?.message?.includes('Network request failed') ||
                error?.message?.includes('Failed to fetch')
              ? 'Can’t reach the AI service — check your connection or API URL in .env'
              : error?.message || "Couldn't optimize right now, try again"
      );
    } finally {
      setOptimizing(false);
    }
  };

  const header = (
    <View style={styles.headerWrap}>
      <View style={styles.eyebrow}>
        <Feather name="coffee" size={13} color={colors.textDim} />
        <Text style={styles.eyebrowText}>{businessName.toUpperCase()}</Text>
        <ThemeColorSlider style={styles.themeIcons} />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Inbox</Text>

        <View style={styles.stats}>
          <View style={styles.statBlock}>
            <View style={styles.ratingRow}>
              <StarRating
                rating={Math.round(business?.averageRating ?? 0)}
                size={18}
              />
              <Text style={styles.ratingValue}>
                {(business?.averageRating ?? 0).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.statLabel}>AVERAGE RATING</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <View style={styles.attentionRow}>
              <View style={styles.attentionDot} />
              <Text style={styles.attentionValue}>{counts.action}</Text>
            </View>
            <Text style={styles.statLabel}>NEED ATTENTION</Text>
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        <StatusIconFilter value={filter} onChange={setFilter} style={styles.statusFilter} />
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={[styles.filterIconBtn, isActive && styles.filterIconBtnActive]}
          accessibilityLabel="Sort and filter"
        >
          <Feather
            name="sliders"
            size={15}
            color={isActive ? colors.accent : colors.textMuted}
          />
          {isActive ? <View style={styles.filterDot} /> : null}
        </Pressable>
      </View>

      {demoActive && tourStep !== 'done' ? <DemoCoachTip /> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            // Room to scroll the editor clear of the keyboard.
            // iOS relies mainly on KeyboardAvoidingView; Android on window resize.
            {
              paddingBottom:
                48 +
                (demoActive ? 220 : 0) +
                (keyboardHeight > 0
                  ? Platform.OS === 'ios'
                    ? 24
                    : Math.max(keyboardHeight * 0.35, 80)
                  : 0),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={
            facebookConnected ? (
              <RefreshControl
                refreshing={refreshing || syncingFacebook}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            ) : undefined
          }
          ListHeaderComponent={header}
          onScrollToIndexFailed={({ index }) => {
            listRef.current?.scrollToOffset({
              offset: Math.max(0, index * 180),
              animated: true,
            });
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index,
                viewPosition: 0.15,
                animated: true,
              });
            }, 100);
          }}
          renderItem={({ item }) => (
            <ReviewRow
              review={item}
              businessName={businessName}
              expanded={expandedId === item.id}
              draft={draft}
              onChangeDraft={setDraft}
              onStartReply={() => startReply(item)}
              onCancelReply={cancelReply}
              onSend={sendReply}
              onOptimize={optimize}
              optimizing={expandedId === item.id && optimizing}
              optimizeError={
                expandedId === item.id ? optimizeError || replyError : null
              }
              onSwipeWillOpen={handleSwipeWillOpen}
              onEditorFocus={() => scrollExpandedIntoView(item.id)}
              demoHighlight={
                demoActive &&
                item.id === focusReviewId &&
                tourStep !== 'done' &&
                !item.replied
              }
              demoTourStep={
                demoActive && item.id === focusReviewId ? tourStep : null
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{emptyMessage}</Text>
          }
          ListFooterComponent={
            filtered.length > 0 ? (
              <View style={styles.footer}>
                <Feather name="loader" size={13} color={colors.textDim} />
                <Text style={styles.footerText}>Loading previous reviews…</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>

      <InboxSortFilterSheet
        visible={sheetOpen}
        initialQuery={query}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          applyQuery(next);
          setSheetOpen(false);
        }}
        onReset={() => {
          resetQuery();
          setSheetOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      width: '100%',
      maxWidth: 1080,
      alignSelf: 'center',
      paddingHorizontal: 40,
      paddingBottom: 48,
    },
    headerWrap: {
      paddingTop: 24,
      paddingBottom: 8,
    },
    eyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    eyebrowText: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: 1.5,
      flexShrink: 1,
    },
    themeIcons: {
      marginLeft: 'auto',
    },
    statusFilter: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 28,
    },
    title: {
      color: colors.text,
      fontSize: 44,
      fontFamily: fonts.display,
      letterSpacing: -1,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
      paddingBottom: 6,
    },
    statBlock: {
      alignItems: 'flex-end',
    },
    statValue: {
      color: colors.text,
      fontSize: 24,
      fontFamily: fonts.sansBold,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingValue: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.sansBold,
    },
    statValueSuffix: {
      color: colors.textDim,
      fontSize: 15,
      fontFamily: fonts.sans,
    },
    statLabel: {
      color: colors.textDim,
      fontSize: 10,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: 1,
      marginTop: 3,
    },
    statDivider: {
      width: 1,
      height: 34,
      backgroundColor: colors.border,
    },
    attentionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    attentionDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.danger,
    },
    attentionValue: {
      color: colors.danger,
      fontSize: 24,
      fontFamily: fonts.sansBold,
    },
    filters: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 8,
    },
    filterIconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },
    filterIconBtnActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    filterDot: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    empty: {
      color: colors.textDim,
      textAlign: 'center',
      marginTop: 60,
      fontSize: 15,
      fontFamily: fonts.sans,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 32,
    },
    footerText: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
    },
  };
}
