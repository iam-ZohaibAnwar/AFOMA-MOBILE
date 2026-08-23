/**
 * Border radius tokens aligned with web usage:
 * - `rounded-sm` buttons (~4px)
 * - `rounded-lg` cards (~12px)
 * - `rounded-full` badges/pills
 */
export const radius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
