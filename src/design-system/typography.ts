import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Web fonts (from `components/appFonts.js` + `styles/globals.css`):
 * - Body/UI: Inter (`--font-inter`)
 * - Display/headings: Noto Serif (`--font-noto-serif`, `.noto-font`)
 *
 * Mobile fallback: load Inter + Noto Serif via `expo-font` in a later step.
 * Until fonts are loaded, React Native falls back to the platform system sans/serif.
 */
export const fontFamily = {
  sans: 'Inter',
  sansFallback: 'System',
  serif: 'NotoSerif',
  serifFallback: 'Georgia',
} as const;

type FontWeight = TextStyle['fontWeight'];

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing?: number;
  color?: string;
}

function sansStyle(
  fontSize: number,
  lineHeight: number,
  fontWeight: FontWeight,
  extras?: Partial<TypographyStyle>,
): TypographyStyle {
  return {
    fontFamily: fontFamily.sans,
    fontSize,
    lineHeight,
    fontWeight,
    ...extras,
  };
}

function serifStyle(
  fontSize: number,
  lineHeight: number,
  fontWeight: FontWeight,
  extras?: Partial<TypographyStyle>,
): TypographyStyle {
  return {
    fontFamily: fontFamily.serif,
    fontSize,
    lineHeight,
    fontWeight,
    ...extras,
  };
}

export const typography = {
  display: serifStyle(32, 38, '700', {
    letterSpacing: -0.5,
    color: colors.textPrimary,
  }),
  h1: serifStyle(28, 34, '700', {
    letterSpacing: -0.4,
    color: colors.textPrimary,
  }),
  h2: serifStyle(22, 28, '700', {
    letterSpacing: -0.3,
    color: colors.textPrimary,
  }),
  h3: sansStyle(18, 24, '700', { color: colors.textPrimary }),
  body: sansStyle(15, 22, '400', { color: colors.textSecondary }),
  bodyMedium: sansStyle(15, 22, '500', { color: colors.textPrimary }),
  bodySmall: sansStyle(13, 18, '400', { color: colors.textSecondary }),
  caption: sansStyle(12, 16, '400', { color: colors.textMuted }),
  button: sansStyle(15, 20, '600', { color: colors.textInverse }),
  price: sansStyle(16, 20, '700', { color: colors.price }),
  label: sansStyle(13, 18, '600', { color: colors.textPrimary }),
} as const;

export type TypographyToken = keyof typeof typography;
