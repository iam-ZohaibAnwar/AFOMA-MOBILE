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

/** Bundled subcategory thumbnails — filenames match API slugs under assets/images/subcategories */
const SUBCATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  'bracelets-and-bangles': require('../../../assets/images/subcategories/bracelets-and-bangles.jpg'),
  'digital-art': require('../../../assets/images/subcategories/digital-art.jpg'),
  earrings: require('../../../assets/images/subcategories/earrings.jpg'),
  'for-kids': require('../../../assets/images/subcategories/for-kids.jpg'),
  'for-men': require('../../../assets/images/subcategories/for-men.jpg'),
  'for-unisex': require('../../../assets/images/subcategories/for-unisex.jpg'),
  'for-women': require('../../../assets/images/subcategories/for-women.jpg'),
  'greeting-cards': require('../../../assets/images/subcategories/greeting-cards.jpg'),
  'handcrafted-decor': require('../../../assets/images/subcategories/handcrafted-decor.jpg'),
  'handmade-soap': require('../../../assets/images/subcategories/handmade-soap.jpg'),
  keychains: require('../../../assets/images/subcategories/keychains.jpg'),
  'lotions-and-body-butters': require(
    '../../../assets/images/subcategories/lotions-and-body-butters.jpg',
  ),
  "men's-clothing": require("../../../assets/images/subcategories/men's-clothing.jpg"),
  'necklaces-and-pendants': require('../../../assets/images/subcategories/necklaces-and-pendants.jpg'),
  'notebooks-and-journals': require('../../../assets/images/subcategories/notebooks-and-journals.jpg'),
  oils: require('../../../assets/images/subcategories/oils.jpg'),
  rings: require('../../../assets/images/subcategories/rings.jpg'),
  'stickers-and-labels': require('../../../assets/images/subcategories/stickers-and-labels.jpg'),
  toys: require('../../../assets/images/subcategories/toys.jpg'),
  "women's-clothing": require("../../../assets/images/subcategories/women's-clothing.jpg"),
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

function lookupLocalImage(
  map: Record<string, ImageSourcePropType>,
  slug: string | undefined | null,
  name?: string | undefined | null,
): ImageSourcePropType | undefined {
  const slugKey = normalizeCategoryKey(slug);
  if (slugKey && map[slugKey]) {
    return map[slugKey];
  }

  const nameKey = normalizeCategoryKey(name);
  if (nameKey && map[nameKey]) {
    return map[nameKey];
  }

  return undefined;
}

/** Parent category hero (PNG bundles). */
export function getCategoryImageSource(
  slug: string | undefined | null,
  name?: string | undefined | null,
): ImageSourcePropType | undefined {
  return lookupLocalImage(CATEGORY_IMAGES, slug, name);
}

/** Subcategory thumbnail (JPG bundles under assets/images/subcategories). */
export function getSubCategoryImageSource(
  slug: string | undefined | null,
  name?: string | undefined | null,
): ImageSourcePropType | undefined {
  return lookupLocalImage(SUBCATEGORY_IMAGES, slug, name);
}

/** Resolves bundled parent category or subcategory image before any remote fallback. */
export function getBrowseCategoryImageSource(
  slug: string | undefined | null,
  name?: string | undefined | null,
): ImageSourcePropType | undefined {
  return getCategoryImageSource(slug, name) ?? getSubCategoryImageSource(slug, name);
}

export function hasLocalCategoryImage(
  slug: string | undefined | null,
  name?: string | undefined | null,
): boolean {
  return getBrowseCategoryImageSource(slug, name) !== undefined;
}
