import { useMemo, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { getLiquidMetalHtml } from './liquidMetalHtml';

const DIAMOND = require('../../assets/liquid-metal-diamond.png');
const { width: W } = Dimensions.get('window');
const DIAMOND_SIZE = Math.min(W * 1.15, 480);

/**
 * Native connect-business backdrop: LiquidMetal via nested WebView,
 * static PNG while loading / on failure.
 */
export function OnboardingBackground() {
  const { colors, themeId } = useTheme();
  const isLight = themeId === 'daylight';
  const [shaderReady, setShaderReady] = useState(false);
  const [shaderFailed, setShaderFailed] = useState(false);

  const veil = isLight
    ? 'rgba(244,245,247,0.55)'
    : 'rgba(11,12,14,0.52)';

  const html = useMemo(
    () =>
      getLiquidMetalHtml({
        colorBack: colors.bg,
        colorTint: '#ffffff',
        speed: 1,
        scale: 0.58,
        softness: 0.3,
        distortion: 0.67,
        contour: 0.42,
        angle: 74,
        repetition: 2,
        shiftRed: 0.3,
        shiftBlue: 0.3,
      }),
    [colors.bg]
  );

  const showFallback = !shaderReady || shaderFailed;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      {showFallback ? (
        <View style={styles.diamondWrap}>
          <Image
            source={DIAMOND}
            style={styles.diamond}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}

      {!shaderFailed ? (
        <WebView
          key={colors.bg}
          source={{ html, baseUrl: 'https://localhost/' }}
          originWhitelist={['*']}
          style={[
            StyleSheet.absoluteFill,
            styles.webView,
            { opacity: shaderReady ? 1 : 0 },
          ]}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
          onMessage={(event) => {
            const data = event?.nativeEvent?.data ?? '';
            if (data === 'ready') {
              setShaderReady(true);
            } else if (typeof data === 'string' && data.startsWith('error:')) {
              setShaderFailed(true);
            }
          }}
          onError={() => setShaderFailed(true)}
          onHttpError={() => setShaderFailed(true)}
        />
      ) : null}

      <View style={[StyleSheet.absoluteFill, { backgroundColor: veil }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {
    backgroundColor: 'transparent',
  },
  diamondWrap: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    left: (W - DIAMOND_SIZE) / 2,
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    zIndex: 0,
  },
  diamond: {
    width: '100%',
    height: '100%',
  },
});
