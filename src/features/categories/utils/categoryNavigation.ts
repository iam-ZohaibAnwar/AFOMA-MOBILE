import type { Category } from '../../../services/types/category';

export function getCategoryRouteId(category: Category): string | undefined {
  return category._id ?? category.slug;
}

export function formatCategoryDisplayName(name: string): string {
  return name.replace(/\s+and\s+/gi, ' & ').replace(/\s+/g, ' ').trim();
}

const CATEGORY_LABEL_MAX_LINES = 3;

/**
 * Splits category names into up to 3 short lines, keeping "&" at the end of a line when present.
 * e.g. "Art & Collectibles" → ["Art &", "Collectibles"]
 *      "Personal Care & Bath Products" → ["Personal", "Care &", "Bath Products"]
 */
export function formatCategoryLabelLines(
  name: string,
  maxLines = CATEGORY_LABEL_MAX_LINES,
): string[] {
  const formatted = formatCategoryDisplayName(name);
  if (!formatted) {
    return ['Category'];
  }

  const ampIndex = formatted.indexOf(' & ');
  if (ampIndex === -1) {
    return [formatted];
  }

  const beforeAmp = formatted.slice(0, ampIndex).trim();
  const afterAmp = formatted.slice(ampIndex + 3).trim();
  const beforeWords = beforeAmp.split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  if (beforeWords.length <= 1) {
    lines.push(`${beforeWords[0] ?? ''} &`.trim());
  } else {
    lines.push(beforeWords[0]);
    lines.push(`${beforeWords.slice(1).join(' ')} &`);
  }

  if (afterAmp) {
    lines.push(afterAmp);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const trimmed = lines.slice(0, maxLines);
  const overflow = lines.slice(maxLines).join(' ');
  trimmed[maxLines - 1] = `${trimmed[maxLines - 1]} ${overflow}`.trim();
  return trimmed;
}

export function getCategoryLabelLineCount(name: string): number {
  return formatCategoryLabelLines(name).length;
}

export function getCategoryDisplayName(category: Category): string {
  const extended = category as Category & {
    SubCategoryName?: string;
    ChildCategoryName?: string;
  };

  const raw =
    category.name?.trim() ||
    extended.SubCategoryName?.trim() ||
    extended.ChildCategoryName?.trim() ||
    category.slug ||
    'Category';

  return formatCategoryDisplayName(raw);
}

export function getNavigableCategories(categories: Category[]): Category[] {
  return categories.filter((category) => Boolean(getCategoryRouteId(category)));
}
