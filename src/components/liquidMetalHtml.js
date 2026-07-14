/**
 * Inline HTML that mounts Paper Design LiquidMetal via CDN (esm.sh).
 * Loaded inside a react-native-webview — Expo native cannot run WebGL shaders directly.
 */
export function getLiquidMetalHtml({
  colorBack = '#0b0c0e',
  colorTint = '#ffffff',
  speed = 1,
  scale = 0.58,
  softness = 0.3,
  distortion = 0.67,
  contour = 0.42,
  angle = 74,
  repetition = 2,
  shiftRed = 0.3,
  shiftBlue = 0.3,
} = {}) {
  const safe = (v) => JSON.stringify(v);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
    #root { position: absolute; inset: 0; width: 100%; height: 100%; background: transparent; }
    #root canvas { display: block; width: 100% !important; height: 100% !important; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import {
      ShaderMount,
      liquidMetalFragmentShader,
      LiquidMetalShapes,
      getShaderColorFromString,
      ShaderFitOptions,
    } from 'https://esm.sh/@paper-design/shaders@0.0.77';

    const root = document.getElementById('root');

    try {
      // eslint-disable-next-line no-new
      new ShaderMount(
        root,
        liquidMetalFragmentShader,
        {
          u_colorBack: getShaderColorFromString(${safe(colorBack)}),
          u_colorTint: getShaderColorFromString(${safe(colorTint)}),
          u_image: undefined,
          u_isImage: false,
          u_shape: LiquidMetalShapes.diamond,
          u_repetition: ${repetition},
          u_softness: ${softness},
          u_shiftRed: ${shiftRed},
          u_shiftBlue: ${shiftBlue},
          u_distortion: ${distortion},
          u_contour: ${contour},
          u_angle: ${angle},
          u_fit: ShaderFitOptions.contain,
          u_scale: ${scale},
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: -0.06,
          u_originX: 0.5,
          u_originY: 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0,
        },
        undefined,
        ${speed}
      );
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready');
      // Also work when this HTML is loaded in a plain iframe (Expo web).
      window.parent && window.parent !== window && window.parent.postMessage('liquid-metal:ready', '*');
    } catch (err) {
      const msg = 'error:' + (err && err.message ? err.message : String(err));
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(msg);
      window.parent && window.parent !== window && window.parent.postMessage('liquid-metal:' + msg, '*');
    }
  </script>
</body>
</html>`;
}
