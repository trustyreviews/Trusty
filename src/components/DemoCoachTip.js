import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useDemo } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const TIPS = {
  spotlight: {
    title: 'Start here',
    body: 'Open Priya’s 1★ review and draft a recovery reply.',
  },
  ai: {
    title: 'Draft with AI',
    body: 'Tap Draft with AI to write a recovery reply in seconds.',
  },
  send: {
    title: 'Post it',
    body: 'Send your reply as Riverside Coffee Co. — then watch the inbox update.',
  },
};

export function DemoCoachTip({ variant = 'floating' }) {
  const { demoActive, tourStep, skipTour } = useDemo();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!demoActive || tourStep === 'done') return null;
  const tip = TIPS[tourStep];
  if (!tip) return null;

  return (
    <View
      style={[styles.card, variant === 'inline' && styles.cardInline]}
      accessibilityRole="summary"
    >
      <View style={styles.iconWrap}>
        <Feather name="compass" size={14} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.body}>{tip.body}</Text>
      </View>
      <Pressable onPress={skipTour} hitSlop={8} accessibilityLabel="Skip tour tip">
        <Feather name="x" size={16} color={colors.textDim} />
      </Pressable>
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },
    cardInline: {
      marginTop: 10,
      marginBottom: 0,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: colors.text,
      fontSize: 13,
      fontFamily: fonts.sansSemiBold,
    },
    body: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.sans,
      lineHeight: 17,
    },
  };
}
