import { spacing } from '../../../design-system';

/** Slightly tighter than screen padding so 2-up category tiles get a bit more width. */
export const CATEGORY_GRID_HORIZONTAL_PADDING = spacing.lg;

export const CATEGORY_GRID_COLUMN_GAP = spacing.xs;

export const CATEGORY_GRID_COLUMNS = 2;

export function getCategoryCompactTileWidth(screenWidth: number): number {
  const gap = CATEGORY_GRID_COLUMN_GAP;
  return (
    (screenWidth -
      CATEGORY_GRID_HORIZONTAL_PADDING * 2 -
      gap * (CATEGORY_GRID_COLUMNS - 1)) /
    CATEGORY_GRID_COLUMNS
  );
}
