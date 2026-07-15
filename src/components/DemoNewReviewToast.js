import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useDemo } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function DemoNewReviewToast() {
  const { liveToast, dismissLiveToast } = useDemo();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!liveToast) return null;

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={styles.toast}>
        <View style={styles.icon}>
          <Feather name="bell" size={16} color={colors.danger} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>New review just in</Text>
          <Text style={styles.body}>
            {liveToast.authorName} left a {liveToast.rating}★ — it’s at the top
            of your inbox.
          </Text>
        </View>
        <Pressable
          onPress={dismissLiveToast}
          hitSlop={8}
          accessibilityLabel="Dismiss notification"
        >
          <Feather name="x" size={16} color={colors.textDim} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    wrap: {
      position: 'absolute',
      top: 16,
      left: 84,
      right: 16,
      zIndex: 50,
      alignItems: 'flex-start',
    },
    toast: {
      maxWidth: 420,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      borderRadius: 14,
      padding: 12,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.dangerSoft,
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
