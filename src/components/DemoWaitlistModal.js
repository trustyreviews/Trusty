import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDemo } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function DemoWaitlistModal() {
  const { waitlistOpen, dismissWaitlist } = useDemo();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    setSubmitted(true);
  };

  const close = () => {
    setEmail('');
    setSubmitted(false);
    dismissWaitlist();
  };

  return (
    <Modal
      visible={waitlistOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.card} accessibilityViewIsModal>
          <Pressable
            style={styles.close}
            onPress={close}
            accessibilityLabel="Close"
          >
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>

          {submitted ? (
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <Feather name="check" size={22} color={colors.onAccent} />
              </View>
              <Text style={styles.title}>You’re on the list</Text>
              <Text style={styles.body}>
                We’ll reach out when your real reviews are ready to connect.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
                onPress={close}
              >
                <Text style={styles.primaryText}>Keep exploring the demo</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.eyebrow}>END OF DEMO</Text>
              <Text style={styles.title}>Ready for your real reviews?</Text>
              <Text style={styles.body}>
                You just recovered a tough guest review in under two minutes.
                Leave your email and we’ll get you early access.
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@yourbusiness.com"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email for early access"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.primary,
                  !email.trim().includes('@') && styles.primaryDisabled,
                  pressed && email.trim().includes('@') && styles.pressed,
                ]}
                onPress={submit}
                disabled={!email.trim().includes('@')}
              >
                <Text style={styles.primaryText}>Get early access</Text>
              </Pressable>
              <Pressable onPress={close} style={styles.secondary}>
                <Text style={styles.secondaryText}>Maybe later</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors, fonts) {
  return {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      gap: 12,
      zIndex: 1,
    },
    close: {
      position: 'absolute',
      top: 14,
      right: 14,
      zIndex: 2,
      padding: 4,
    },
    eyebrow: {
      color: colors.accent,
      fontSize: 11,
      fontFamily: fonts.sansBold,
      letterSpacing: 1.4,
      marginTop: 4,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontFamily: fonts.sansSemiBold,
      letterSpacing: -0.4,
      lineHeight: 28,
      paddingRight: 24,
    },
    body: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.sans,
      lineHeight: 21,
    },
    input: {
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
      fontFamily: fonts.sans,
    },
    primary: {
      marginTop: 4,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
    },
    primaryDisabled: {
      opacity: 0.45,
    },
    primaryText: {
      color: colors.onAccent,
      fontSize: 14,
      fontFamily: fonts.sansSemiBold,
    },
    secondary: {
      alignItems: 'center',
      paddingVertical: 6,
    },
    secondaryText: {
      color: colors.textDim,
      fontSize: 13,
      fontFamily: fonts.sansMedium,
    },
    success: {
      alignItems: 'center',
      gap: 10,
      paddingTop: 8,
      paddingBottom: 4,
    },
    successIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    pressed: {
      opacity: 0.88,
    },
  };
}
