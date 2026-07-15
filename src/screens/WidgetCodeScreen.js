import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COMPANY } from '../config/company';
import { useThemedStyles } from '../hooks/useThemedStyles';

function buildSnippet(theme) {
  return `<div id="trusty-reviews"></div>
<script
  src="${COMPANY.widgetUrl}"
  data-trusty-widget
  data-theme="${theme}"
  data-max="4"
  async
></script>`;
}

export function WidgetCodeScreen() {
  const styles = useThemedStyles(createStyles);
  const [theme, setTheme] = useState('light');
  const snippet = useMemo(() => buildSnippet(theme), [theme]);

  const copySnippet = async () => {
    try {
      await Clipboard.setStringAsync(snippet);
      Alert.alert('Copied', 'Paste the snippet into your website before </body>.');
    } catch {
      Alert.alert('Copy failed', 'Select the code and copy it manually.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Embed a compact reviews carousel on your site. It shows your rating and
          a few of your best reviews, and refreshes about once a day.
        </Text>

        <Text style={styles.label}>Theme</Text>
        <View style={styles.segment}>
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
          ].map((option) => {
            const active = theme === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setTheme(option.id)}
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

        <Text style={styles.label}>Embed code</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>{snippet}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.copyBtn, pressed && styles.pressed]}
          onPress={copySnippet}
        >
          <Text style={styles.copyBtnText}>Copy widget code</Text>
        </Pressable>

        <Text style={styles.hint}>
          Paste before the closing body tag on any page. The widget loads from
          Trusty Pages and caches review data in the visitor’s browser for 24
          hours.
        </Text>
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
    scroll: {
      flex: 1,
    },
    content: {
      padding: 24,
      paddingBottom: 48,
      gap: 12,
    },
    lead: {
      fontFamily: fonts.sans,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
      marginBottom: 8,
    },
    label: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 13,
      color: colors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 8,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 4,
      gap: 4,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    segmentBtnActive: {
      backgroundColor: colors.surfaceAlt,
    },
    segmentText: {
      fontFamily: fonts.sansMedium,
      fontSize: 14,
      color: colors.textMuted,
    },
    segmentTextActive: {
      color: colors.text,
    },
    codeBlock: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
    },
    code: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.accent,
    },
    copyBtn: {
      marginTop: 4,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    copyBtnText: {
      fontFamily: fonts.sansBold,
      fontSize: 15,
      color: colors.onAccent,
    },
    pressed: {
      opacity: 0.85,
    },
    hint: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textDim,
      marginTop: 4,
    },
  };
}
