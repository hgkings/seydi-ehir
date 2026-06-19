// Seydişehir Sosyal - Design tokens
export const colors = {
  surface: '#F9F8F6',
  onSurface: '#1A1A1A',
  surfaceSecondary: '#FFFFFF',
  onSurfaceSecondary: '#1A1A1A',
  surfaceTertiary: '#F0EBE6',
  onSurfaceTertiary: '#333333',
  surfaceInverse: '#1A1A1A',
  onSurfaceInverse: '#FFFFFF',
  brand: '#C35235',
  brandPrimary: '#C35235',
  onBrandPrimary: '#FFFFFF',
  brandSecondary: '#DF7A61',
  brandTertiary: '#FCEEEB',
  onBrandTertiary: '#C35235',
  success: '#3E7D59',
  warning: '#D98C2C',
  error: '#B83A3A',
  info: '#4A6C7A',
  border: '#E8E4DF',
  borderStrong: '#D1CCC5',
  divider: '#E8E4DF',
  muted: '#7A7A7A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};
