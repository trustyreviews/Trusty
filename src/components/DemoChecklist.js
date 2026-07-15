import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { DEMO_CHECKLIST, useDemo } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function DemoChecklist() {
  const {
    demoActive,
    completed,
    allComplete,
    checklistOpen,
    setChecklistOpen,
    resetDemo,
    setWaitlistOpen,
  } = useDemo();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!demoActive) return null;

  if (!checklistOpen) {
    return (
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={() => setChecklistOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open demo checklist"
      >
        <Feather name="list" size={16} color={colors.onAccent} />
        <Text style={styles.fabText}>Demo</Text>
      </Pressable>
    );
  }

  const doneCount = DEMO_CHECKLIST.filter((s) => completed[s.id]).length;

  return (
    <View style={styles.panel} accessibilityLabel="Demo checklist">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Try these 4</Text>
          <Text style={styles.progress}>
            {doneCount}/{DEMO_CHECKLIST.length} done
          </Text>
        </View>
        <Pressable
          onPress={() => setChecklistOpen(false)}
          hitSlop={8}
          accessibilityLabel="Minimize checklist"
        >
          <Feather name="minus" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {DEMO_CHECKLIST.map((step) => {
          const done = completed[step.id];
          return (
            <View key={step.id} style={styles.item}>
              <View style={[styles.check, done && styles.checkDone]}>
                {done ? (
                  <Feather name="check" size={12} color={colors.onAccent} />
                ) : null}
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.label, done && styles.labelDone]}>
                  {step.label}
                </Text>
                <Text style={styles.detail}>{step.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        {allComplete ? (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => setWaitlistOpen(true)}
          >
            <Text style={styles.primaryBtnText}>Ready for real reviews?</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
          onPress={resetDemo}
          accessibilityRole="button"
          accessibilityLabel="Reset demo"
        >
          <Feather name="refresh-cw" size={13} color={colors.textMuted} />
          <Text style={styles.resetText}>Reset demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 24,
      zIndex: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.accent,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 999,
    },
    fabText: {
      color: colors.onAccent,
      fontSize: 13,
      fontFamily: fonts.sansSemiBold,
    },
    panel: {
      position: 'absolute',
      right: 16,
      bottom: 20,
      zIndex: 40,
      width: 280,
      maxWidth: '92%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontFamily: fonts.sansSemiBold,
    },
    progress: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sans,
    },
    list: {
      gap: 10,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    check: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    checkDone: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    itemText: {
      flex: 1,
      gap: 1,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontFamily: fonts.sansMedium,
      lineHeight: 18,
    },
    labelDone: {
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    detail: {
      color: colors.textDim,
      fontSize: 11,
      fontFamily: fonts.sans,
      lineHeight: 15,
    },
    footer: {
      gap: 8,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: colors.onAccent,
      fontSize: 13,
      fontFamily: fonts.sansSemiBold,
    },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 6,
    },
    resetText: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.sansMedium,
    },
    pressed: {
      opacity: 0.85,
    },
  };
}
