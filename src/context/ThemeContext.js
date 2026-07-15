import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_THEME_ID, THEMES, fonts, getTheme } from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);

  const setThemeId = useCallback((nextId) => {
    if (THEMES[nextId]) setThemeIdState(nextId);
  }, []);

  const value = useMemo(() => {
    const colors = getTheme(themeId);
    return {
      themeId,
      setThemeId,
      colors,
      fonts,
      themes: Object.values(THEMES),
    };
  }, [themeId, setThemeId]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
