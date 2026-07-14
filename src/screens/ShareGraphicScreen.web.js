import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShareGraphicCard,
  SHARE_GRAPHIC_SIZES,
} from '../components/ShareGraphicCard';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
  downloadImageFromDataUri,
  safeFilenamePart,
} from '../utils/downloadImage';
import { canShareReview } from '../utils/shareGraphic';

/**
 * Web share screen — captures a real DOM node with html2canvas and
 * downloads a PNG via Blob (ViewShot + scaled previews fail in browsers).
 */
export function ShareGraphicScreen({ route, navigation }) {
  const { reviewId } = route.params ?? {};
  const { reviews, business } = useReviews();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const review = reviews.find((r) => r.id === reviewId);
  const [format, setFormat] = useState('square');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const hostRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();

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

  const fileName = [
    'trusty',
    safeFilenamePart(business?.name),
    format,
    safeFilenamePart(review.authorName),
  ]
    .filter(Boolean)
    .join('-')
    .concat('.png');

  const downloadPng = async () => {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const host = hostRef.current;
      if (!host) throw new Error('Capture target is not ready yet.');

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(host, {
        backgroundColor: null,
        scale: 1,
        width: size.width,
        height: size.height,
        windowWidth: size.width,
        windowHeight: size.height,
        useCORS: true,
        logging: false,
      });

      const dataUri = canvas.toDataURL('image/png');
      downloadImageFromDataUri(dataUri, fileName);
      setStatus(`Saved ${fileName} to your Downloads folder.`);
    } catch (err) {
      console.warn('[ShareGraphic] web download failed', err);
      setStatus(err?.message || 'Download failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Full-size offscreen DOM host for html2canvas */}
      <div
        ref={hostRef}
        aria-hidden
        style={{
          position: 'fixed',
          left: -10000,
          top: 0,
          width: size.width,
          height: size.height,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <ShareGraphicCard
          review={review}
          businessName={business?.name}
          format={format}
        />
      </div>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Preview a branded graphic, then download the PNG to your computer.
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
              <ShareGraphicCard
                review={review}
                businessName={business?.name}
                format={format}
              />
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (pressed || busy) && styles.pressed,
          ]}
          onPress={downloadPng}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.primaryBtnText}>Download PNG</Text>
          )}
        </Pressable>

        {status ? <Text style={styles.status}>{status}</Text> : null}
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
    status: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
      textAlign: 'center',
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
