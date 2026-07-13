import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { optimizeReply } from '../api/optimizeReply';
import { InboxSortFilterSheet } from '../components/InboxSortFilterSheet';
import { ReviewRow } from '../components/ReviewRow';
import { useInboxQuery } from '../context/InboxQueryContext';
import { useReviews } from '../context/ReviewsContext';
import { useSettings } from '../context/SettingsContext';
import { colors, fonts } from '../theme';
import { applyInboxQuery } from '../utils/inboxQuery';
import { needsAction, suggestDraft } from '../utils/reviewHelpers';

const FILTERS = [
  { id: 'all', label: 'All Reviews' },
  { id: 'action', label: 'Requires Action' },
  { id: 'unanswered', label: 'Unanswered' },
];

export function InboxScreen() {
  const { reviews, business, markRead, replyToReview } = useReviews();
  const { tone } = useSettings();
  const { query, applyQuery, resetQuery, isActive } = useInboxQuery();
  const businessName = business?.name ?? 'Your business';

  const [filter, setFilter] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState(null);
  const openSwipeableRef = useRef(null);

  const handleSwipeWillOpen = (swipeableRef) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== swipeableRef) {
      openSwipeableRef.current.current?.close();
    }
    openSwipeableRef.current = swipeableRef;
  };

  const counts = useMemo(
    () => ({
      all: reviews.length,
      action: reviews.filter(needsAction).length,
      unanswered: reviews.filter((r) => !r.replied).length,
    }),
    [reviews]
  );

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === 'action') list = reviews.filter(needsAction);
    else if (filter === 'unanswered') list = reviews.filter((r) => !r.replied);
    // Advanced sort/filter is additive on top of the active tab.
    return applyInboxQuery(list, query);
  }, [reviews, filter, query]);

  const startReply = (review) => {
    openSwipeableRef.current?.current?.close();
    openSwipeableRef.current = null;
    markRead(review.id);
    setDraft(review.replyText || suggestDraft(review, businessName, tone));
    setOptimizeError(null);
    setExpandedId(review.id);
  };

  const cancelReply = () => {
    setExpandedId(null);
    setDraft('');
    setOptimizeError(null);
  };

  const sendReply = () => {
    if (!draft.trim()) return;
    replyToReview(expandedId, draft);
    setExpandedId(null);
    setDraft('');
    setOptimizeError(null);
  };

  const optimize = async () => {
    const review = reviews.find((r) => r.id === expandedId);
    if (!review || !draft.trim() || optimizing) return;

    setOptimizing(true);
    setOptimizeError(null);
    try {
      // On failure we keep the user's draft untouched (see catch).
      const polished = await optimizeReply({
        reviewText: review.text,
        draftReply: draft,
      });
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] InboxScreen.optimize: success, polished reply received', {
        polished,
      });
      setDraft(polished);
    } catch (error) {
      // TEMPORARY — remove once Optimize with AI failures are diagnosed
      console.log('[DEBUG] InboxScreen.optimize: catch/error', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause,
        fullError: error,
      });
      setOptimizeError("Couldn't optimize right now, try again");
    } finally {
      setOptimizing(false);
    }
  };

  const header = (
    <View style={styles.headerWrap}>
      <View style={styles.eyebrow}>
        <Feather name="coffee" size={13} color={colors.textDim} />
        <Text style={styles.eyebrowText}>{businessName.toUpperCase()}</Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Inbox</Text>

        <View style={styles.stats}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>
              {(business?.averageRating ?? 0).toFixed(1)}
              <Text style={styles.statValueSuffix}> /5</Text>
            </Text>
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
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id];
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {f.label}
              </Text>
              {f.id === 'action' && count > 0 ? (
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{count}</Text>
                </View>
              ) : (
                <Text style={[styles.pillCount, active && styles.pillCountActive]}>
                  {f.id === 'all' ? `(${count})` : count}
                </Text>
              )}
            </Pressable>
          );
        })}
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
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
            optimizeError={expandedId === item.id ? optimizeError : null}
            onSwipeWillOpen={handleSwipeWillOpen}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isActive
              ? 'No reviews match these filters.'
              : "Nothing here — you're all caught up."}
          </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.sansSemiBold,
  },
  pillTextActive: {
    color: '#0b0c0e',
  },
  pillCount: {
    color: colors.textDim,
    fontSize: 13,
    fontFamily: fonts.sansMedium,
  },
  pillCountActive: {
    color: '#0b0c0e',
  },
  pillBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  pillBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.sansBold,
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
});
