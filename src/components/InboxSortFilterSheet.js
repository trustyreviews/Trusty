import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
  DATE_OPTIONS,
  RATING_OPTIONS,
  REPLY_STATUS_OPTIONS,
  SORT_OPTIONS,
  SOURCE_OPTIONS,
} from '../utils/inboxQuery';

export function InboxSortFilterSheet({ visible, initialQuery, onApply, onReset, onClose }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [draft, setDraft] = useState(initialQuery);

  useEffect(() => {
    if (visible) {
      setDraft(initialQuery);
    }
  }, [visible, initialQuery]);

  const setSort = (sort) => setDraft((prev) => ({ ...prev, sort }));
  const setDateRange = (dateRange) => setDraft((prev) => ({ ...prev, dateRange }));
  const setReplyStatus = (replyStatus) =>
    setDraft((prev) => ({ ...prev, replyStatus }));

  const toggleSource = (id) => {
    setDraft((prev) => {
      const has = prev.sources.includes(id);
      return {
        ...prev,
        sources: has
          ? prev.sources.filter((s) => s !== id)
          : [...prev.sources, id],
      };
    });
  };

  const toggleRating = (id) => {
    setDraft((prev) => {
      const has = prev.ratings.includes(id);
      return {
        ...prev,
        ratings: has
          ? prev.ratings.filter((r) => r !== id)
          : [...prev.ratings, id],
      };
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Sort & filter</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Section title="Sort">
              {SORT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={draft.sort === option.id}
                  mode="radio"
                  onPress={() => setSort(option.id)}
                />
              ))}
            </Section>

            <Section title="Source" hint="Select any combination">
              {SOURCE_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={draft.sources.includes(option.id)}
                  mode="check"
                  onPress={() => toggleSource(option.id)}
                />
              ))}
            </Section>

            <Section title="Star rating" hint="Select any combination">
              {RATING_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={draft.ratings.includes(option.id)}
                  mode="check"
                  onPress={() => toggleRating(option.id)}
                />
              ))}
            </Section>

            <Section title="Date range">
              {DATE_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={draft.dateRange === option.id}
                  mode="radio"
                  onPress={() => setDateRange(option.id)}
                />
              ))}
            </Section>

            <Section title="Reply status">
              {REPLY_STATUS_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={draft.replyStatus === option.id}
                  mode="radio"
                  onPress={() => setReplyStatus(option.id)}
                />
              ))}
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onReset();
              }}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            >
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable
              onPress={() => onApply(draft)}
              style={({ pressed }) => [styles.applyBtn, pressed && styles.pressed]}
            >
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, hint, children }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function OptionRow({ label, selected, mode, onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>
        {label}
      </Text>
      <View
        style={[
          mode === 'radio' ? styles.radio : styles.checkbox,
          selected && (mode === 'radio' ? styles.radioActive : styles.checkboxActive),
        ]}
      >
        {selected ? (
          mode === 'radio' ? (
            <View style={styles.radioDot} />
          ) : (
            <Feather name="check" size={12} color={colors.onAccent} />
          )
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(colors, fonts) {
  return {
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    backdropTap: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
      maxHeight: '88%',
      paddingTop: 8,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 10,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingBottom: 12,
    },
    sheetTitle: {
      color: colors.text,
      fontSize: 22,
      fontFamily: fonts.display,
      letterSpacing: -0.4,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 12,
    },
    section: {
      marginBottom: 26,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 4,
    },
    sectionHint: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
      marginBottom: 10,
    },
    sectionBody: {
      marginTop: 6,
      gap: 2,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    optionLabel: {
      color: colors.textMuted,
      fontSize: 15,
      fontFamily: fonts.sans,
      flex: 1,
      paddingRight: 16,
    },
    optionLabelActive: {
      color: colors.text,
      fontFamily: fonts.sansMedium,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: {
      borderColor: colors.accent,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 24,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    resetBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    resetText: {
      color: colors.textMuted,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
    },
    applyBtn: {
      flex: 1.4,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.pillActiveBg,
      alignItems: 'center',
    },
    applyText: {
      color: colors.pillActiveText,
      fontSize: 15,
      fontFamily: fonts.sansBold,
    },
    pressed: {
      opacity: 0.75,
    },
  };
}
