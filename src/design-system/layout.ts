import { spacing, screenPaddingHorizontal, sectionGap } from './spacing';

/**
 * Layout helpers for mobile safe areas and content rhythm.
 * Use with `useSafeAreaInsets()` from `react-native-safe-area-context` —
 * never hardcode device-specific notch/home-indicator heights.
 */
export const layout = {
  screenPaddingHorizontal,
  sectionGap,
  contentGap: spacing.lg,
  cardGap: spacing.md,
  minTouchTarget: 44,
} as const;

/** Adds safe-area top inset to a base padding value. */
export function withSafeAreaTop(basePadding: number, insetTop: number): number {
  return insetTop + basePadding;
}

/** Adds safe-area bottom inset — useful above tab bars or home indicators. */
export function withSafeAreaBottom(basePadding: number, insetBottom: number): number {
  return insetBottom + basePadding;
}
