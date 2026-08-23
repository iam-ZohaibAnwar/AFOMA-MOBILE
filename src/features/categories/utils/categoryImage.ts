import type { ImageSourcePropType } from 'react-native';

const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  'art-and-collectibles': require('../../../assets/images/categories/Art_and_Collectibles.png'),
  fashion: require('../../../assets/images/categories/fashion.png'),
  'home-and-living': require('../../../assets/images/categories/Home_and_Living.png'),
  'jewelry-and-accessories': require('../../../assets/images/categories/Jewelry_and_Accessories.png'),
  'personal-care-and-bath-products': require(
    '../../../assets/images/categories/Personal_Care_and_Bath_Products.png',
  ),
  'stationery-and-paper-goods': require(
    '../../../assets/images/categories/Stationery_and_Paper_Goods.png',
  ),
  'toys-and-games': require('../../../assets/images/categories/Toys_and_Games.png'),
};

function normalizeCategoryKey(value: string | undefined | null): string | undefined {
  if (value == null) {
    return undefined;
  }

  const trimmed = String(value).trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/_/g, '-').replace(/\s+/g, '-');
}

export function getCategoryImageSource(
  slug: string | undefined | null,
  name?: string | undefined | null,
): ImageSourcePropType | undefined {
  const slugKey = normalizeCategoryKey(slug);
  if (slugKey && CATEGORY_IMAGES[slugKey]) {
    return CATEGORY_IMAGES[slugKey];
  }

  const nameKey = normalizeCategoryKey(name);
  if (nameKey && CATEGORY_IMAGES[nameKey]) {
    return CATEGORY_IMAGES[nameKey];
  }

  return undefined;
}

export function hasLocalCategoryImage(
  slug: string | undefined | null,
  name?: string | undefined | null,
): boolean {
  return getCategoryImageSource(slug, name) !== undefined;
}
