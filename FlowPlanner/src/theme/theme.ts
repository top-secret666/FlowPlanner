const colors = {
  bg: '#0f172a',
  surface: '#1e293b',
  surface2: '#273449',
  border: '#334155',
  primary: '#0d9488',
  primaryHover: '#0f766e',
  primaryLight: 'rgba(13, 148, 136, 0.15)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textFaint: '#475569',
  success: '#22c55e',
  error: '#f87171',
  warning: '#fbbf24',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const typography = {
  hero: 32,
  h1: 24,
  h2: 20,
  h3: 16,
  body: 15,
  small: 13,
  tiny: 11,
};

const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = { colors, spacing, radius, typography, shadows };