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

export const colors = {
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
  danger: '#ef4444',
  dangerSoft: '#3a1618',
  dangerBorder: '#b91c1c',
  dangerText: '#f87171',
  warning: '#f59e0b',
  star: '#f0a53e',
  unread: '#5eead4',
  white: '#ffffff',
};
