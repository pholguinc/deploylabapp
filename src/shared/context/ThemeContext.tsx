import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, defaultThemeMode, lightColors, ThemeColors, ThemeMode } from '../theme';

type ThemeContextType = Readonly<{
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}>;

const STORAGE_KEY = '@deploylab_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: defaultThemeMode,
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mode, setMode] = useState<ThemeMode>(defaultThemeMode);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'dark' || saved === 'light') {
          setMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  };

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
  };

  const colors = mode === 'dark' ? darkColors : lightColors;
  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider
      value={{ mode, colors, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
