import type { VariationRow } from '../types/customizableProductForm';
import { createEmptyVariationRow } from '../types/customizableProductForm';

export const VARIATION_META_KEYS = new Set([
  'id',
  'surTotalAmount',
  'surTotalAmountBDis',
  'image',
  'price',
  'inventory',
  'quantity',
  'finalPrice',
  'totalPrice',
  'currencyPrice',
]);

export function getAttributeKeysFromVariationRows(rows: VariationRow[]): string[] {
  if (!rows.length) {
    return [];
  }

  return Object.keys(rows[0]).filter((key) => !VARIATION_META_KEYS.has(key));
}

export function variationRowsHaveAttributeData(rows: VariationRow[], attribute: string): boolean {
  return rows.some((row) => String(row[attribute] ?? '').trim() !== '');
}

export function getAttributesWithDataBeingRemoved(
  rows: VariationRow[],
  nextAttributes: string[],
): string[] {
  const next = new Set(nextAttributes);
  const previous = getAttributeKeysFromVariationRows(rows);

  return previous.filter(
    (attribute) => !next.has(attribute) && variationRowsHaveAttributeData(rows, attribute),
  );
}

export function reshapeVariationRowsForAttributes(
  rows: VariationRow[],
  newAttributes: string[],
): VariationRow[] {
  if (!rows.length) {
    return rows;
  }

  const attributes = newAttributes.filter((attribute) => attribute !== 'image');

  return rows.map((row) => {
    const reshaped = createEmptyVariationRow(attributes);
    reshaped.id = row.id;

    attributes.forEach((attribute) => {
      reshaped[attribute] = row[attribute] ?? '';
    });

    reshaped.inventory = row.inventory ?? '';
    reshaped.quantity = row.quantity ?? '';
    reshaped.price = row.price ?? '';
    reshaped.currencyPrice = row.currencyPrice ?? '';
    reshaped.image = row.image ?? '';

    return reshaped;
  });
}

export interface AttributeTogglePlan {
  nextSelectedAttributes: string[];
  removedAttributesWithData: string[];
  isDeselecting: boolean;
}

export function planAttributeToggle(
  attribute: string,
  selectedAttributes: string[],
  rows: VariationRow[],
): AttributeTogglePlan {
  const isDeselecting = selectedAttributes.includes(attribute);
  const nextSelectedAttributes = isDeselecting
    ? selectedAttributes.filter((item) => item !== attribute)
    : [...selectedAttributes, attribute];

  const removedAttributesWithData = isDeselecting
    ? getAttributesWithDataBeingRemoved(rows, nextSelectedAttributes)
    : [];

  return {
    nextSelectedAttributes,
    removedAttributesWithData,
    isDeselecting,
  };
}

export function formatRemovedAttributesMessage(removedAttributes: string[]): string {
  if (removedAttributes.length === 1) {
    return `Removing ${removedAttributes[0]} will clear that data from your variation rows. Continue?`;
  }

  return `Removing ${removedAttributes.join(', ')} will clear that data from your variation rows. Continue?`;
}
