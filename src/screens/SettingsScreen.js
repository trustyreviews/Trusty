import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPANY } from '../config/company';
import { useDemo } from '../context/DemoContext';
import { useReviews } from '../context/ReviewsContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function SettingsScreen({ navigation }) {
  const {
    business,
    disconnectBusiness,
    deleteAllData,
    syncFacebookReviews,
    disconnectFacebook,
    syncingFacebook,
    facebookConnected,
  } = useReviews();
  const { demoActive, resetDemo } = useDemo();
  const {
    notifications,
    updateNotifications,
    tone,
    setTone,
    accounts,
    toggleAccount,
    subscription,
    cancelSubscription,
    resetSettings,
  } = useSettings();
  const { colors, themeId, setThemeId, themes } = useTheme();
  const styles = useThemedStyles(createStyles);
  const facebookSyncedRef = useRef(false);

  useEffect(() => {
    const fb = accounts.find((a) => a.id === 'facebook');
    if (!fb?.connected || facebookSyncedRef.current) return;
    facebookSyncedRef.current = true;
    syncFacebookReviews().catch(() => {
      facebookSyncedRef.current = false;
    });
  }, [accounts, syncFacebookReviews]);

  const confirmDisconnectAccount = (account) => {
    if (account.id === 'facebook' && !account.connected) {
      Alert.alert(
        'Connect Facebook?',
        'Trusty will fetch reviews from your Facebook Page (Trusty Inc.).',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: syncingFacebook ? 'Connecting…' : 'Connect',
            onPress: async () => {
              try {
                const count = await syncFacebookReviews();
                toggleAccount('facebook');
                Alert.alert(
                  'Facebook connected',
                  count > 0
                    ? `Loaded ${count} Facebook review${count === 1 ? '' : 's'}.`
                    : 'Connected — your Page has no Facebook reviews yet.'
                );
              } catch (error) {
                Alert.alert(
                  'Facebook sync failed',
                  error?.message ||
                    'Check that npm run api is running and EXPO_PUBLIC_API_BASE_URL is set.'
                );
              }
            },
          },
        ]
      );
      return;
    }

    if (account.id === 'facebook' && account.connected) {
      Alert.alert(
        'Disconnect Facebook?',
        'Trusty will stop syncing Facebook reviews. Existing Facebook reviews will be removed from the inbox.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              disconnectFacebook();
              toggleAccount('facebook');
            },
          },
        ]
      );
      return;
    }

    const action = account.connected ? 'Disconnect' : 'Connect';
    Alert.alert(
      `${action} ${account.label}?`,
      account.connected
        ? 'Trusty will stop syncing reviews from this account. You can reconnect anytime.'
        : 'This will start a mock connection for demo purposes. Real OAuth comes later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => toggleAccount(account.id),
        },
      ]
    );
  };

  const confirmCancelPlan = () => {
    if (subscription.status === 'canceled') {
      Alert.alert('Already canceled', 'Your Pro plan is marked as canceled in this demo.');
      return;
    }
    Alert.alert(
      'Cancel subscription?',
      'Your plan will stay active until the end of the billing period. You can resubscribe anytime.',
      [
        { text: 'Keep plan', style: 'cancel' },
        {
          text: 'Cancel plan',
          style: 'destructive',
          onPress: () => {
            cancelSubscription();
            Alert.alert('Subscription canceled', 'No further charges in this demo.');
          },
        },
      ]
    );
  };

  const confirmDeleteData = () => {
    Alert.alert(
      'Delete all my data?',
      'This permanently clears your connected business, reviews, and local preferences from this device. This cannot be undone.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            deleteAllData();
          },
        },
      ]
    );
  };

  const confirmDisconnectBusiness = () => {
    Alert.alert(
      'Disconnect business?',
      'You will return to the connect screen. Review data stays on this device until you delete it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectBusiness(),
        },
      ]
    );
  };

  const confirmResetDemo = () => {
    Alert.alert(
      'Reset demo?',
      'Restores Riverside Coffee Co. sample reviews and restarts the guided walkthrough.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset demo',
          onPress: () => resetDemo(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACCOUNT</Text>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Business profile */}
        <Section
          title="Business profile"
          hint="Connected review sources and the business Trusty is watching."
        >
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Business name</Text>
            <Text style={styles.cardValue}>{business?.name ?? '—'}</Text>
            {business?.address ? (
              <Text style={styles.cardMeta}>{business.address}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={confirmDisconnectBusiness}
            >
              <Text style={styles.secondaryBtnText}>Disconnect business</Text>
            </Pressable>
          </View>

          {accounts.map((account) => (
            <View key={account.id} style={styles.accountRow}>
              <View style={styles.accountMeta}>
                <Text style={styles.accountName}>{account.label}</Text>
                <Text
                  style={[
                    styles.accountStatus,
                    (account.connected || (account.id === 'facebook' && facebookConnected)) &&
                      styles.accountStatusOn,
                  ]}
                >
                  {account.connected || (account.id === 'facebook' && facebookConnected)
                    ? 'Connected'
                    : 'Not connected'}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  account.connected || (account.id === 'facebook' && facebookConnected)
                    ? styles.ghostBtn
                    : styles.primaryBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => confirmDisconnectAccount(account)}
              >
                <Text
                  style={
                    account.connected || (account.id === 'facebook' && facebookConnected)
                      ? styles.ghostBtnText
                      : styles.primaryBtnText
                  }
                >
                  {account.connected || (account.id === 'facebook' && facebookConnected)
                    ? 'Disconnect'
                    : 'Connect'}
                </Text>
              </Pressable>
            </View>
          ))}
        </Section>

        {/* Appearance */}
        <Section
          title="Appearance"
          hint="Choose a color theme for Trusty. Your pick stays on this device."
        >
          {themes.map((theme) => {
            const active = themeId === theme.id;
            return (
              <Pressable
                key={theme.id}
                onPress={() => setThemeId(theme.id)}
                style={({ pressed }) => [
                  styles.themeRow,
                  active && styles.themeRowActive,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[styles.themeSwatch, { backgroundColor: theme.accent }]}
                />
                <View style={styles.themeMeta}>
                  <Text style={styles.themeLabel}>{theme.label}</Text>
                  <Text style={styles.themeHint}>{theme.hint}</Text>
                </View>
                {active ? (
                  <Feather name="check" size={16} color={colors.accent} />
                ) : null}
              </Pressable>
            );
          })}
        </Section>

        {/* Website widget */}
        <Section
          title="Website widget"
          hint="Embed a reviews carousel on your own site."
        >
          <Pressable
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('WidgetCode')}
          >
            <Text style={styles.linkRowText}>Get your widget code</Text>
            <Feather name="chevron-right" size={16} color={colors.textDim} />
          </Pressable>
        </Section>

        {/* Notifications */}
        <Section
          title="Notifications"
          hint="Choose how you’re alerted when new reviews arrive."
        >
          <View style={styles.card}>
            <ToggleRow
              label="Push notifications"
              value={notifications.push}
              onValueChange={(push) => updateNotifications({ push })}
            />
            <ToggleRow
              label="Email alerts"
              value={notifications.email}
              onValueChange={(email) => updateNotifications({ email })}
              last
            />
          </View>

          <Text style={styles.subheading}>Alert me about</Text>
          <View style={styles.segment}>
            {[
              { id: 'negative', label: 'Only negative' },
              { id: 'all', label: 'All reviews' },
            ].map((option) => {
              const active = notifications.scope === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => updateNotifications({ scope: option.id })}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Reply tone */}
        <Section
          title="Reply tone"
          hint="Used when drafting and optimizing replies with AI."
        >
          <Text style={styles.subheading}>Default tone</Text>
          <View style={styles.segment}>
            {[
              { id: 'casual', label: 'Casual' },
              { id: 'formal', label: 'Formal' },
            ].map((option) => {
              const active = tone === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setTone(option.id)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>
              {tone === 'formal' ? 'Formal' : 'Casual'} for AI drafts
            </Text>
            <Text style={styles.examplesHint}>
              {tone === 'formal'
                ? 'AI replies will sound polished and professional — think “Dear…”, “We sincerely…”, fewer contractions.'
                : 'AI replies will sound warm and conversational — think “Hi…”, first names, natural phrasing.'}
            </Text>
            <Text style={[styles.examplesHint, { marginTop: 8 }]}>
              Replies are written by you or Draft/Optimize with AI — never from canned templates.
            </Text>
          </View>
        </Section>

        {/* Account / subscription */}
        <Section
          title="Account & subscription"
          hint="Plan details and an easy way to cancel — no hunting through email threads."
        >
          <View style={styles.card}>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.cardLabel}>Current plan</Text>
                <Text style={styles.cardValue}>{subscription.plan}</Text>
              </View>
              <Text style={styles.price}>{subscription.price}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {subscription.status === 'active'
                ? `Renews ${subscription.renewsOn}`
                : 'Access continues until the period ends'}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.dangerGhostBtn,
                pressed && styles.pressed,
              ]}
              onPress={confirmCancelPlan}
            >
              <Text style={styles.dangerGhostText}>Cancel subscription</Text>
            </Pressable>
          </View>
        </Section>

        {demoActive ? (
          <Section
            title="Demo"
            hint="You’re exploring sample Riverside Coffee Co. data."
          >
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Guided walkthrough</Text>
              <Text style={styles.cardMeta}>
                Reset restores the original reviews and checklist progress.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.pressed,
                ]}
                onPress={confirmResetDemo}
              >
                <Text style={styles.secondaryBtnText}>Reset demo</Text>
              </Pressable>
            </View>
          </Section>
        ) : null}

        {/* Data / privacy */}
        <Section
          title="Data & privacy"
          hint="You’re in control of the customer data Trusty stores for you."
        >
          <Pressable
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.linkRowText}>Privacy policy</Text>
            <Feather name="chevron-right" size={16} color={colors.textDim} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.linkRowText}>Company website</Text>
            <Feather name="chevron-right" size={16} color={colors.textDim} />
          </Pressable>

          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.dangerTitle}>Delete my data</Text>
            <Text style={styles.dangerBody}>
              Removes business connection, reviews, and preferences from this
              device. Contact {COMPANY.supportEmail} if you need a server-side
              wipe later.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.dangerBtn,
                pressed && styles.pressed,
              ]}
              onPress={confirmDeleteData}
            >
              <Text style={styles.dangerBtnText}>Delete all my data</Text>
            </Pressable>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, hint, children }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function ToggleRow({ label, value, onValueChange, last }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.toggleRow, last && styles.toggleRowLast]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accentSoft }}
        thumbColor={value ? colors.accent : colors.textDim}
      />
    </View>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      width: '100%',
      maxWidth: 880,
      alignSelf: 'center',
      paddingHorizontal: 40,
      paddingBottom: 56,
    },
    header: {
      paddingTop: 24,
      marginBottom: 28,
    },
    eyebrow: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    title: {
      color: colors.text,
      fontSize: 44,
      fontFamily: fonts.display,
      letterSpacing: -1,
    },
    section: {
      marginBottom: 36,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 6,
    },
    sectionHint: {
      color: colors.textDim,
      fontSize: 14,
      fontFamily: fonts.sans,
      lineHeight: 20,
      marginBottom: 14,
    },
    subheading: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    cardLabel: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    cardValue: {
      color: colors.text,
      fontSize: 20,
      fontFamily: fonts.sansSemiBold,
    },
    cardMeta: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sans,
      marginTop: 6,
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    accountMeta: {
      flex: 1,
    },
    accountName: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 3,
    },
    accountStatus: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
    },
    accountStatusOn: {
      color: colors.accent,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    themeRowActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    themeSwatch: {
      width: 28,
      height: 28,
      borderRadius: 8,
    },
    themeMeta: {
      flex: 1,
    },
    themeLabel: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 2,
    },
    themeHint: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    toggleRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    toggleLabel: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansMedium,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: 'center',
    },
    segmentBtnActive: {
      backgroundColor: colors.pillActiveBg,
    },
    segmentText: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: fonts.sansSemiBold,
    },
    segmentTextActive: {
      color: colors.pillActiveText,
    },
    examplesCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    examplesTitle: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 4,
    },
    examplesHint: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
      marginBottom: 14,
    },
    exampleBlock: {
      marginBottom: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    exampleBlockLast: {
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    exampleLabel: {
      color: colors.accent,
      fontSize: 11,
      fontFamily: fonts.sansBold,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    exampleBody: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sans,
      lineHeight: 21,
    },
    planRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    price: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.sansBold,
    },
    primaryBtn: {
      backgroundColor: colors.pillActiveBg,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    primaryBtnText: {
      color: colors.pillActiveText,
      fontSize: 13,
      fontFamily: fonts.sansBold,
    },
    ghostBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    ghostBtnText: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: fonts.sansSemiBold,
    },
    secondaryBtn: {
      marginTop: 14,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
    },
    secondaryBtnText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    dangerGhostBtn: {
      marginTop: 14,
      alignSelf: 'flex-start',
      paddingVertical: 8,
    },
    dangerGhostText: {
      color: colors.dangerText,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    linkRowText: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansMedium,
    },
    dangerCard: {
      marginTop: 8,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    dangerTitle: {
      color: colors.dangerText,
      fontSize: 16,
      fontFamily: fonts.sansSemiBold,
      marginBottom: 6,
    },
    dangerBody: {
      color: colors.textMuted,
      fontSize: 13,
      fontFamily: fonts.sans,
      lineHeight: 20,
      marginBottom: 14,
    },
    dangerBtn: {
      alignSelf: 'flex-start',
      backgroundColor: colors.danger,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    dangerBtnText: {
      color: colors.white,
      fontSize: 13,
      fontFamily: fonts.sansBold,
    },
    pressed: {
      opacity: 0.7,
    },
  };
}
