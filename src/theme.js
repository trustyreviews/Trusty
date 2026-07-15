// App-wide type uses Outfit. Falls back to system fonts until useFonts()
// resolves (see App.js), so nothing breaks before fonts load.
export const fonts = {
  sans: 'Outfit_400Regular',
  sansMedium: 'Outfit_500Medium',
  sansSemiBold: 'Outfit_600SemiBold',
  sansBold: 'Outfit_700Bold',
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
};

/** Shared semantic tokens every palette must define. */
const shared = {
  danger: '#ef4444',
  dangerSoft: '#3a1618',
  dangerBorder: '#b91c1c',
  dangerText: '#f87171',
  warning: '#f59e0b',
  star: '#f0a53e',
  white: '#ffffff',
};

export const THEMES = {
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    hint: 'Dark with teal accents',
    ...shared,
    bg: '#0b0c0e',
    sidebar: '#0d0e11',
    surface: '#131417',
    surfaceAlt: '#1a1c20',
    panel: '#141519',
    border: '#232529',
    hairline: '#1c1e22',
    text: '#f4f4f3',
    textMuted: '#9a9ba0',
    textDim: '#63656b',
    avatar: '#26282e',
    accent: '#2dd4bf',
    accentSoft: '#123f3a',
    unread: '#5eead4',
    // Inverse surfaces used by light pills / primary buttons on dark UIs
    onAccent: '#0b0c0e',
    pillActiveBg: '#ffffff',
    pillActiveText: '#0b0c0e',
  },
  daylight: {
    id: 'daylight',
    label: 'Daylight',
    hint: 'Light and airy',
    ...shared,
    dangerSoft: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerText: '#dc2626',
    bg: '#f4f5f7',
    sidebar: '#ebecef',
    surface: '#ffffff',
    surfaceAlt: '#f0f1f3',
    panel: '#ffffff',
    border: '#d8dade',
    hairline: '#e4e5e8',
    text: '#141518',
    textMuted: '#5c5e66',
    textDim: '#8b8d96',
    avatar: '#e4e5e8',
    accent: '#0d9488',
    accentSoft: '#ccfbf1',
    unread: '#0f766e',
    onAccent: '#ffffff',
    pillActiveBg: '#141518',
    pillActiveText: '#ffffff',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    hint: 'Cool blue-gray',
    ...shared,
    bg: '#0c1117',
    sidebar: '#0e141c',
    surface: '#141b24',
    surfaceAlt: '#1a2330',
    panel: '#151c26',
    border: '#243041',
    hairline: '#1c2633',
    text: '#eef2f6',
    textMuted: '#94a3b8',
    textDim: '#64748b',
    avatar: '#243041',
    accent: '#38bdf8',
    accentSoft: '#0c4a6e',
    unread: '#7dd3fc',
    onAccent: '#0c1117',
    pillActiveBg: '#eef2f6',
    pillActiveText: '#0c1117',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    hint: 'Deep green accents',
    ...shared,
    bg: '#0c100e',
    sidebar: '#0e1310',
    surface: '#141a16',
    surfaceAlt: '#1a221c',
    panel: '#151b17',
    border: '#243028',
    hairline: '#1c241e',
    text: '#f2f5f2',
    textMuted: '#9aa89e',
    textDim: '#66736a',
    avatar: '#243028',
    accent: '#4ade80',
    accentSoft: '#14532d',
    unread: '#86efac',
    onAccent: '#0c100e',
    pillActiveBg: '#f2f5f2',
    pillActiveText: '#0c100e',
  },
};

export const DEFAULT_THEME_ID = 'midnight';

export function getTheme(themeId) {
  return THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID];
}

/** @deprecated Prefer useTheme().colors — kept for modules that still import statically. */
export const colors = THEMES[DEFAULT_THEME_ID];
