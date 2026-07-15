import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPANY } from '../config/company';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

// Person account screen — login identity, sign out, help.
// Business preferences live in Settings; keep those concerns separate.
const APP_VERSION = '1.0.0';

export function ProfileScreen({ navigation }) {
  const { user, initials, updateUser } = useUser();
  const { disconnectBusiness } = useReviews();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [draftEmail, setDraftEmail] = useState(user.email);

  const startEdit = () => {
    setDraftName(user.name);
    setDraftEmail(user.email);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraftName(user.name);
    setDraftEmail(user.email);
    setEditing(false);
  };

  const saveEdit = () => {
    if (!draftName.trim() || !draftEmail.trim()) {
      Alert.alert('Missing info', 'Name and email can’t be empty.');
      return;
    }
    updateUser({ name: draftName, email: draftEmail });
    setEditing(false);
  };

  const changePassword = () => {
    // Stub until auth is wired (OAuth / email-password provider).
    Alert.alert(
      'Change password',
      'Password changes aren’t available in this demo yet. You’ll be able to update your password here once account auth is connected.'
    );
  };

  const openSupport = () => {
    const subject = encodeURIComponent('Trusty support');
    const body = encodeURIComponent(
      `Hi Trusty team,\n\nI need help with:\n\n\n— ${user.name}\n${user.email}`
    );
    Linking.openURL(`mailto:${COMPANY.supportEmail}?subject=${subject}&body=${body}`);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You’ll need to connect your business again to continue.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          // Ends the session and returns to onboarding (mock auth).
          disconnectBusiness();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your personal account</Text>
        </View>

        {/* 1. Account info */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          {editing ? (
            <>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={draftName}
                onChangeText={setDraftName}
                autoCapitalize="words"
                placeholderTextColor={colors.textDim}
              />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={draftEmail}
                onChangeText={setDraftEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={colors.textDim}
              />
              <View style={styles.editActions}>
                <Pressable
                  onPress={cancelEdit}
                  style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.ghostBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={saveEdit}
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoCopy}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Text style={styles.fieldValue}>{user.name}</Text>
                </View>
                <Pressable
                  onPress={startEdit}
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.editLink}>Edit</Text>
                </Pressable>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={styles.infoCopy}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <Text style={styles.fieldValue}>{user.email}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <Pressable
          onPress={changePassword}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.rowText}>Change password</Text>
          <Feather name="chevron-right" size={16} color={colors.textDim} />
        </Pressable>

        {/* Help & support */}
        <Text style={[styles.sectionLabel, styles.sectionSpacer]}>Help</Text>
        <Pressable
          onPress={openSupport}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View>
            <Text style={styles.rowText}>Help & support</Text>
            <Text style={styles.rowMeta}>Email {COMPANY.supportEmail}</Text>
          </View>
          <Feather name="mail" size={16} color={colors.textDim} />
        </Pressable>

        {/* Sign out — separated at the bottom */}
        <View style={styles.signOutWrap}>
          <Pressable
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        {/* App info */}
        <Text style={styles.version}>Trusty v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors, fonts) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingHorizontal: 28,
      paddingTop: 8,
      paddingBottom: 40,
      maxWidth: 560,
      width: '100%',
      alignSelf: 'center',
    },
    hero: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 8,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.avatar,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      color: colors.textMuted,
      fontSize: 22,
      fontFamily: fonts.sansBold,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontFamily: fonts.display,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textDim,
      fontSize: 14,
      fontFamily: fonts.sans,
    },
    sectionLabel: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    sectionSpacer: {
      marginTop: 28,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      paddingBottom: 16,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    infoRowLast: {
      paddingBottom: 0,
      marginBottom: 0,
      borderBottomWidth: 0,
    },
    infoCopy: {
      flex: 1,
    },
    fieldLabel: {
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sansSemiBold,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 6,
    },
    fieldValue: {
      color: colors.text,
      fontSize: 16,
      fontFamily: fonts.sansMedium,
    },
    editLink: {
      color: colors.accent,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
      marginTop: 2,
    },
    input: {
      color: colors.text,
      fontSize: 16,
      fontFamily: fonts.sans,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    ghostBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    ghostBtnText: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    saveBtn: {
      backgroundColor: colors.pillActiveBg,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
    },
    saveBtnText: {
      color: colors.pillActiveText,
      fontSize: 14,
      fontFamily: fonts.sansBold,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    rowText: {
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sansMedium,
    },
    rowMeta: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sans,
      marginTop: 3,
    },
    signOutWrap: {
      marginTop: 40,
      paddingTop: 28,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    signOutBtn: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    signOutText: {
      color: colors.dangerText,
      fontSize: 15,
      fontFamily: fonts.sansSemiBold,
    },
    version: {
      marginTop: 28,
      textAlign: 'center',
      color: colors.textDim,
      fontSize: 12,
      fontFamily: fonts.sans,
    },
    pressed: {
      opacity: 0.7,
    },
  };
}
