/**
 * Mobile spacing scale (4pt base).
 * Prefer these tokens over arbitrary pixel values in new UI work.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/** Default horizontal screen padding for scrollable content. */
export const screenPaddingHorizontal = spacing.xl;

/** Default vertical gap between major sections. */
export const sectionGap = spacing['3xl'];

export type SpacingToken = keyof typeof spacing;
