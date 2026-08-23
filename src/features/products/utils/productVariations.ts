import type { Product, ProductVariation } from '../../../services/types/product';

/** Keys on variation rows that are metadata, not customer-facing attributes. */
export const VARIATION_META_KEYS = new Set([
  'inventory',
  'quantity',
  'price',
  'image',
  'totalPrice',
  'finalPrice',
  'surTotalAmount',
  'surTotalAmountBDis',
  'currencyPrice',
  '_id',
  'id',
]);

export type SelectedAttributes = Record<string, string>;

export interface VariationAttributeSelection {
  attributeName: string;
  attributeValue: string;
}

export function normalizeVariationAttributeValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

export function isVariationAttributeKey(key: string): boolean {
  return !VARIATION_META_KEYS.has(key);
}

export function getVariationAttributeNames(variations: ProductVariation[] | undefined): string[] {
  if (!variations?.length) {
    return [];
  }

  return Object.keys(variations[0]).filter(isVariationAttributeKey);
}

export function getUniqueAttributeValues(
  variations: ProductVariation[],
  attributeName: string,
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const variation of variations) {
    const normalized = normalizeVariationAttributeValue(variation[attributeName]);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    values.push(normalized);
  }

  return values;
}

export function variationMatchesSelection(
  variation: ProductVariation,
  selectedAttributes: SelectedAttributes,
): boolean {
  return Object.entries(selectedAttributes).every(
    ([key, value]) =>
      normalizeVariationAttributeValue(variation[key]) === normalizeVariationAttributeValue(value),
  );
}

export function findMatchingVariation(
  variations: ProductVariation[] | undefined,
  selectedAttributes: SelectedAttributes,
): ProductVariation | undefined {
  if (!variations?.length || !selectedAttributes) {
    return undefined;
  }

  return variations.find((variation) => variationMatchesSelection(variation, selectedAttributes));
}

export function areAllAttributesSelected(
  variations: ProductVariation[] | undefined,
  selectedAttributes: SelectedAttributes,
): boolean {
  const attributeNames = getVariationAttributeNames(variations);
  if (attributeNames.length === 0) {
    return false;
  }

  return attributeNames.every((name) => {
    const value = selectedAttributes[name];
    return normalizeVariationAttributeValue(value) !== '';
  });
}

export function buildDefaultSelectedAttributes(
  variations: ProductVariation[] | undefined,
): SelectedAttributes {
  if (!variations?.length) {
    return {};
  }

  const defaultVariation =
    variations.find((variation) => !isInventoryOutOfStock(variation.inventory)) ??
    variations[0];

  return getVariationAttributeNames(variations).reduce<SelectedAttributes>((acc, attributeName) => {
    const value = normalizeVariationAttributeValue(defaultVariation[attributeName]);
    if (value) {
      acc[attributeName] = value;
    }
    return acc;
  }, {});
}

export function buildAttributeSelectionArray(
  variations: ProductVariation[] | undefined,
  selectedAttributes: SelectedAttributes,
): VariationAttributeSelection[] {
  const attributeNames = getVariationAttributeNames(variations);
  if (!attributeNames.length) {
    return [];
  }

  return attributeNames.map((attributeName) => ({
    attributeName,
    attributeValue:
      selectedAttributes[attributeName] !== undefined
        ? selectedAttributes[attributeName]
        : normalizeVariationAttributeValue(variations?.[0]?.[attributeName]),
  }));
}

/** Cart payload should only include fully selected customizable attributes. */
export function buildSelectedVariationsForCart(
  variations: ProductVariation[] | undefined,
  selectedAttributes: SelectedAttributes,
): VariationAttributeSelection[] {
  if (!areAllAttributesSelected(variations, selectedAttributes)) {
    return [];
  }

  return getVariationAttributeNames(variations).map((attributeName) => ({
    attributeName,
    attributeValue: selectedAttributes[attributeName],
  }));
}

export function buildCustomizableCartKey(
  productId: string,
  selections: VariationAttributeSelection[],
): string {
  if (!selections.length) {
    return productId;
  }

  const variantSuffix = selections
    .map((selection) => selection.attributeValue.replace(/\s+/g, ''))
    .join('_');

  return `${productId}_${variantSuffix}`;
}

export function findCartVariation(
  product: Product,
  selectedVariations: VariationAttributeSelection[],
): ProductVariation | null {
  if (!product.variations?.length || !selectedVariations.length) {
    return null;
  }

  return (
    product.variations.find((variation) =>
      selectedVariations.every(
        (selected) =>
          normalizeVariationAttributeValue(variation[selected.attributeName]) ===
          normalizeVariationAttributeValue(selected.attributeValue),
      ),
    ) ?? null
  );
}

export function getVariationMaxQuantity(variation: ProductVariation | undefined): number {
  const raw = variation?.quantity;
  const quantity =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw)
        : NaN;

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

export function getProductMaxQuantity(product: Product | null | undefined): number {
  const raw = product?.quantity;
  const quantity =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw)
        : NaN;

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function isInventoryOutOfStock(inventory: unknown): boolean {
  const normalized = normalizeVariationAttributeValue(inventory).toLowerCase();
  return normalized === 'outoffstock' || normalized === 'out of stock';
}

export function hasAnyInStockVariation(
  variations: ProductVariation[] | undefined,
): boolean {
  if (!variations?.length) {
    return false;
  }

  return variations.some((variation) => !isInventoryOutOfStock(variation.inventory));
}

export function isVariationOptionAvailable(
  variations: ProductVariation[] | undefined,
  attributeName: string,
  optionValue: string,
  selectedAttributes: SelectedAttributes,
): boolean {
  if (!variations?.length) {
    return true;
  }

  const attributeNames = getVariationAttributeNames(variations);
  const normalizedOption = normalizeVariationAttributeValue(optionValue);

  return variations.some((variation) => {
    if (normalizeVariationAttributeValue(variation[attributeName]) !== normalizedOption) {
      return false;
    }

    for (const name of attributeNames) {
      if (name === attributeName) {
        continue;
      }

      const selectedValue = selectedAttributes[name];
      if (!selectedValue) {
        continue;
      }

      if (
        normalizeVariationAttributeValue(variation[name]) !==
        normalizeVariationAttributeValue(selectedValue)
      ) {
        return false;
      }
    }

    return !isInventoryOutOfStock(variation.inventory);
  });
}

export function getVariationInventory(
  variations: ProductVariation[] | undefined,
  selectedAttributes: SelectedAttributes,
): string | undefined {
  const matching = findMatchingVariation(variations, selectedAttributes);
  if (!matching) {
    return 'OutOffStock';
  }

  return typeof matching.inventory === 'string' ? matching.inventory : String(matching.inventory ?? '');
}

export function getVariationImageUrl(variation: ProductVariation | undefined): string | undefined {
  if (!variation?.image) {
    return undefined;
  }

  if (typeof variation.image === 'string') {
    return variation.image;
  }

  if (typeof variation.image === 'object' && variation.image !== null) {
    const record = variation.image as { imageUrl?: string };
    return record.imageUrl;
  }

  return undefined;
}

export function resolveProductImageUrl(
  product: Product,
  matchingVariation?: ProductVariation,
): string | undefined {
  const variationImage = getVariationImageUrl(matchingVariation);
  if (variationImage) {
    return variationImage;
  }

  return product.images?.[0]?.imageUrl;
}
