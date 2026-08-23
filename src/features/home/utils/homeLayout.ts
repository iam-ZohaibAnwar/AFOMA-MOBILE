import { screenPaddingHorizontal, spacing } from '../../../design-system';

export function getHomeGridCardWidth(screenWidth: number, columns = 2): number {
  const horizontalPadding = screenPaddingHorizontal * 2;
  const totalGap = spacing.md * (columns - 1);
  return (screenWidth - horizontalPadding - totalGap) / columns;
}

export function getHomeHorizontalProductCardWidth(screenWidth: number): number {
  const horizontalPadding = screenPaddingHorizontal * 2;
  const peek = 48;
  return Math.max(148, Math.min(168, screenWidth - horizontalPadding - peek));
}

export function getHomeCategoryCardWidth(screenWidth: number): number {
  const horizontalPadding = screenPaddingHorizontal * 2;
  const gaps = spacing.md * 2;
  const visibleCards = screenWidth >= 768 ? 4.2 : 2.8;
  return Math.max(112, (screenWidth - horizontalPadding - gaps) / visibleCards);
}
