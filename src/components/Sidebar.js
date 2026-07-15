import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '../context/DemoContext';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

// Custom left navigation rail (rendered as the tab bar via tabBarPosition="left").
export function Sidebar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { unreadNegativeCount, business } = useReviews();
  const { demoActive } = useDemo();
  const { initials } = useUser();
  const styles = useThemedStyles(createStyles);

  const activeRoute = state.routes[state.index]?.name;

  const go = (routeName) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r) => r.name === routeName)?.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const openProfile = () => {
    // Profile lives on the root stack (person account), not a business tab.
    const root = navigation.getParent();
    if (root) {
      root.navigate('Profile');
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <View style={[styles.rail, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 14 }]}>
      <View style={styles.logoBlock}>
        <View style={styles.logo}>
          <Feather name="coffee" size={20} color="#1a1c20" />
        </View>
        {demoActive ? (
          <View style={styles.demoBadge} accessibilityLabel="Demo mode">
            <Text style={styles.demoBadgeText} numberOfLines={2}>
              Demo
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.nav}>
        <RailButton
          icon="inbox"
          active={activeRoute === 'Inbox'}
          badge={unreadNegativeCount > 0}
          onPress={() => go('Inbox')}
        />
        <RailButton
          icon="bar-chart-2"
          active={activeRoute === 'Analytics'}
          onPress={() => go('Analytics')}
        />
        <RailButton
          icon="users"
          active={activeRoute === 'Business'}
          onPress={() => go('Business')}
        />
        <RailButton
          icon="settings"
          active={activeRoute === 'Settings'}
          onPress={() => go('Settings')}
        />
      </View>

      {demoActive && business?.name ? (
        <Text style={styles.demoBiz} numberOfLines={3}>
          {business.name}
        </Text>
      ) : null}

      <Pressable
        onPress={openProfile}
        style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </Pressable>
    </View>
  );
}

function RailButton({ icon, active, disabled, badge, onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.railBtn,
        active && styles.railBtnActive,
        pressed && !disabled && styles.railBtnPressed,
      ]}
    >
      <Feather
        name={icon}
        size={20}
        color={active ? colors.text : disabled ? colors.textDim : colors.textMuted}
      />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

function createStyles(colors, fonts) {
  return {
    rail: {
      width: 68,
      backgroundColor: colors.sidebar,
      borderRightWidth: 1,
      borderRightColor: colors.hairline,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#e7e5e1',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoBlock: {
      alignItems: 'center',
      gap: 8,
      marginBottom: 20,
    },
    demoBadge: {
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    demoBadgeText: {
      color: colors.accent,
      fontSize: 10,
      fontFamily: fonts.sansBold,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    demoBiz: {
      color: colors.textDim,
      fontSize: 9,
      fontFamily: fonts.sansMedium,
      textAlign: 'center',
      lineHeight: 12,
      paddingHorizontal: 6,
      marginBottom: 10,
    },
    nav: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
    },
    railBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    railBtnActive: {
      backgroundColor: colors.surfaceAlt,
    },
    railBtnPressed: {
      backgroundColor: colors.surface,
    },
    badge: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      borderColor: colors.sidebar,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.avatar,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarPressed: {
      opacity: 0.7,
    },
    avatarText: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.sansBold,
    },
  };
}
