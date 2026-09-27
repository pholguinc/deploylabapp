export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  text: string;
  textMuted: string;
  danger: string;
  textOnPrimary: string;
  white: string;
  black: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  accent: '#10B981',
  text: '#0F172A',
  textMuted: '#64748B',
  danger: '#EF4444',
  textOnPrimary: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: ThemeColors = {
  background: '#0B0E14',
  surface: '#141925',
  surfaceAlt: '#1C2331',
  border: '#242C3D',
  primary: '#4F7BFF',
  primaryDark: '#3A5FE0',
  accent: '#3DDC97',
  text: '#F5F7FA',
  textMuted: '#8992A6',
  danger: '#FF6B6B',
  textOnPrimary: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
};

export const defaultThemeMode: ThemeMode = 'light';
export const colors: ThemeColors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const getThemeColors = (mode: ThemeMode = defaultThemeMode): ThemeColors => {
  return mode === 'dark' ? darkColors : lightColors;
};

export default {
  colors,
  lightColors,
  darkColors,
  spacing,
  radius,
  getThemeColors,
};
