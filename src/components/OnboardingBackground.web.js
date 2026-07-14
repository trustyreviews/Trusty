import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DIAMOND = require('../../assets/liquid-metal-diamond.png');
const { width: W } = Dimensions.get('window');
const DIAMOND_SIZE = Math.min(W * 1.15, 480);

const SHADER_PARAMS = {
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
};

/**
 * Web connect-business backdrop: mount Paper LiquidMetal directly in the DOM.
 * (Nested react-native-webview + CDN never signals ready on Expo web.)
 */
export function OnboardingBackground() {
  const { colors, themeId } = useTheme();
  const isLight = themeId === 'daylight';
  const [shaderReady, setShaderReady] = useState(false);
  const [shaderFailed, setShaderFailed] = useState(false);
  const hostRef = useRef(null);
  const mountRef = useRef(null);

  const veil = isLight
    ? 'rgba(244,245,247,0.28)'
    : 'rgba(11,12,14,0.28)';

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return undefined;

    (async () => {
      try {
        const {
          ShaderMount,
          liquidMetalFragmentShader,
          LiquidMetalShapes,
          getShaderColorFromString,
          ShaderFitOptions,
        } = await import('@paper-design/shaders');

        if (cancelled) return;

        mountRef.current?.dispose?.();
        host.replaceChildren();

        mountRef.current = new ShaderMount(
          host,
          liquidMetalFragmentShader,
          {
            u_colorBack: getShaderColorFromString(colors.bg),
            u_colorTint: getShaderColorFromString(SHADER_PARAMS.colorTint),
            u_image: undefined,
            u_isImage: false,
            u_shape: LiquidMetalShapes.diamond,
            u_repetition: SHADER_PARAMS.repetition,
            u_softness: SHADER_PARAMS.softness,
            u_shiftRed: SHADER_PARAMS.shiftRed,
            u_shiftBlue: SHADER_PARAMS.shiftBlue,
            u_distortion: SHADER_PARAMS.distortion,
            u_contour: SHADER_PARAMS.contour,
            u_angle: SHADER_PARAMS.angle,
            u_fit: ShaderFitOptions.contain,
            u_scale: SHADER_PARAMS.scale,
            u_rotation: 0,
            u_offsetX: 0,
            u_offsetY: -0.06,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0,
          },
          undefined,
          SHADER_PARAMS.speed
        );

        if (!cancelled) setShaderReady(true);
      } catch (err) {
        console.warn('[LiquidMetal] web mount failed', err);
        if (!cancelled) setShaderFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mountRef.current?.dispose?.();
      mountRef.current = null;
      host.replaceChildren();
    };
  }, [colors.bg]);

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
        <div
          ref={hostRef}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: shaderReady ? 1 : 0,
          }}
        />
      ) : null}

      <View style={[StyleSheet.absoluteFill, { backgroundColor: veil }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
