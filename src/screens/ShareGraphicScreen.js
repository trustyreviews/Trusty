import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  ShareGraphicCard,
  SHARE_GRAPHIC_SIZES,
} from '../components/ShareGraphicCard';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { canShareReview } from '../utils/shareGraphic';

function downloadDataUri(dataUri, filename) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function safeFilenamePart(value) {
  return String(value || 'review')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function ShareGraphicScreen({ route, navigation }) {
  const { reviewId } = route.params ?? {};
  const { reviews, business } = useReviews();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const review = reviews.find((r) => r.id === reviewId);
  const [format, setFormat] = useState('square');
  const [busy, setBusy] = useState(false);
  const shotRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  if (!review || !canShareReview(review)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Share not available</Text>
          <Text style={styles.emptyBody}>
            Share graphics are only for 4–5 star reviews.
          </Text>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryBtnText}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const size = SHARE_GRAPHIC_SIZES[format];
  const previewWidth = Math.min(windowWidth - 48, 340);
  const scale = previewWidth / size.width;

  const saveAndShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (isWeb) {
        // view-shot on web returns a data URI when result is tmpfile/data-uri
        const dataUri = await shotRef.current.capture({
          format: 'png',
          quality: 1,
          result: 'data-uri',
        });
        const name = [
          'trusty',
          safeFilenamePart(business?.name),
          format,
          safeFilenamePart(review.authorName),
        ]
          .filter(Boolean)
          .join('-');
        downloadDataUri(dataUri, `${name}.png`);
        return;
      }

      const uri = await shotRef.current.capture();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          'Ready',
          'Sharing isn’t available on this device. The graphic was generated successfully.'
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share review graphic',
        UTI: 'public.png',
      });
    } catch (err) {
      Alert.alert(
        'Couldn’t export',
        err?.message || 'Something went wrong capturing the graphic.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          {isWeb
            ? 'Preview a branded graphic, then download the PNG to your computer.'
            : 'Preview a branded graphic, then download or share it to Instagram, TikTok, or Messages.'}
        </Text>

        <View style={styles.segment}>
          {[
            { id: 'square', label: 'Square' },
            { id: 'story', label: 'Story' },
          ].map((option) => {
            const active = format === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setFormat(option.id)}
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

        <View style={styles.previewShell}>
          <View
            style={[
              styles.previewClip,
              {
                width: size.width * scale,
                height: size.height * scale,
              },
            ]}
          >
            <View
              style={{
                width: size.width,
                height: size.height,
                transform: [
                  { translateX: (size.width * (scale - 1)) / 2 },
                  { translateY: (size.height * (scale - 1)) / 2 },
                  { scale },
                ],
              }}
            >
              <ViewShot
                ref={shotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                style={{ width: size.width, height: size.height }}
              >
                <ShareGraphicCard
                  review={review}
                  businessName={business?.name}
                  format={format}
                />
              </ViewShot>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (pressed || busy) && styles.pressed,
          ]}
          onPress={saveAndShare}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isWeb ? 'Download PNG' : 'Download / Share'}
            </Text>
          )}
        </Pressable>
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
      padding: 24,
      paddingBottom: 40,
      gap: 16,
    },
    lead: {
      fontFamily: fonts.sans,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
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
    previewShell: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    previewClip: {
      overflow: 'hidden',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      minHeight: 50,
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontFamily: fonts.sansBold,
      fontSize: 15,
      color: colors.onAccent,
    },
    pressed: {
      opacity: 0.85,
    },
    empty: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      gap: 12,
    },
    emptyTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 20,
      color: colors.text,
    },
    emptyBody: {
      fontFamily: fonts.sans,
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 8,
    },
    secondaryBtn: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryBtnText: {
      fontFamily: fonts.sansSemiBold,
      color: colors.text,
    },
  };
}
