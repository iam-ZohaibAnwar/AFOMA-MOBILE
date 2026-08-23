/** Muted banner backgrounds for top-level category cards (reference: sage, taupe, slate). */
export const CATEGORY_BANNER_COLORS = [
  '#7A8F7E',
  '#9A8B7A',
  '#6B7F8A',
  '#8A7A6B',
  '#7E8791',
  '#8F7A82',
  '#6E8578',
] as const;

export function getCategoryBannerColor(index: number): string {
  return CATEGORY_BANNER_COLORS[index % CATEGORY_BANNER_COLORS.length];
}
