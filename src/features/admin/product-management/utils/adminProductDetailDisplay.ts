import { env } from '../../../../app/config/env';
import type { Product } from '../../../../services/types/product';
import { getProductDescription } from '../../../products/utils/productDisplay';
import { getProductShareUrl } from '../../../products/utils/productShare';
import {
  getVariationAttributeNames,
  getVariationImageUrl,
} from '../../../products/utils/productVariations';
import { mapDownloadFileFromProduct } from '../../../seller/products/utils/productFormMappers';
import { formatSellerListPrice } from '../../../seller/products/utils/sellerProductListDisplay';
import { SELLER_INVENTORY_OPTIONS } from '../../../seller/products/utils/standardProductConstants';
import {
  formatAdminProductApprovalStatus,
  formatAdminProductInventoryStatus,
} from './adminProductDisplay';

export type AdminProductDetailSectionKey =
  | 'summary'
  | 'seller'
  | 'approval'
  | 'categories'
  | 'pricing'
  | 'media'
  | 'shipping'
  | 'download'
  | 'seo'
  | 'variations';

export function getAdminProductDetailSections(
  product: Product,
): Record<AdminProductDetailSectionKey, boolean> {
  const type = product.productType;

  return {
    summary: true,
    seller: true,
    approval: true,
    categories: true,
    pricing: true,
    media: true,
    shipping: type === 'Standard' || type === 'Customizable',
    download: type === 'Downloadable',
    seo: true,
    variations: type === 'Customizable' && (product.variations?.length ?? 0) > 0,
  };
}

export function formatAdminProductDescription(product: Product): string {
  return getProductDescription(product);
}

export function formatAdminProductStockStatus(inventory?: string): string {
  const match = SELLER_INVENTORY_OPTIONS.find((option) => option.value === inventory);
  if (match) {
    return match.label;
  }

  return inventory?.trim() || '—';
}

export function getAdminProductCategoryPath(product: Product): string {
  const parts = [product.Category?.name, product.SubCategory?.name, product.childCategory?.name]
    .map((name) => name?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' › ') : '—';
}

export function formatAdminProductCurrencyLabel(currency?: string): string {
  if (!currency?.trim()) {
    return 'CAD';
  }

  return currency.trim().toUpperCase();
}

export function formatAdminProductMoney(value: unknown, currency = 'CAD'): string {
  if (value == null || value === '') {
    return '—';
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? `${currency} ${parsed.toFixed(2)}` : '—';
}

export function formatAdminProductDiscount(product: Product): string {
  const discount = product.discountCode;
  if (discount == null || discount === 0) {
    return '—';
  }

  const parsed = typeof discount === 'number' ? discount : Number.parseFloat(String(discount));
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed}%` : '—';
}

export function formatAdminProductSummaryPrice(product: Product): string {
  return formatSellerListPrice(product);
}

export function hasAdminProductCustomShipping(product: Product): boolean {
  return Boolean(product.freeDelivery || product.handlingFee);
}

export function formatAdminProductBoolean(value: unknown): string {
  if (value === true) {
    return 'Yes';
  }

  if (value === false) {
    return 'No';
  }

  return '—';
}

export function formatAdminProductDimension(value: unknown, unit: string): string {
  if (value == null || value === '') {
    return '—';
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? `${parsed} ${unit}` : String(value);
}

export function formatAdminProductQuantity(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : String(value);
}

export function getAdminProductPreviewUrl(slug?: string): string | undefined {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return undefined;
  }

  const base =
    env.webUrl?.replace(/\/$/, '') ||
    env.apiUrl?.replace(/\/$/, '') ||
    'https://afomamarketplace.com';

  return `${base}/preview/${encodeURIComponent(trimmed)}`;
}

export function getAdminProductLiveUrl(slug?: string, productId?: string): string | undefined {
  return getProductShareUrl(slug, productId);
}

export function getAdminProductDownloadInfo(product: Product): {
  fileName: string;
  fileUrl?: string;
} | null {
  const file = mapDownloadFileFromProduct(product);
  if (!file) {
    return null;
  }

  return {
    fileName: file.featuredProduct?.trim() || 'Download file',
    fileUrl: file.featuredProductUrl?.trim() || undefined,
  };
}

export interface AdminVariationDisplayRow {
  id: string;
  title: string;
  attributes: Array<{ label: string; value: string }>;
  fields: Array<{ label: string; value: string }>;
  imageUrl?: string;
}

const VARIATION_DISPLAY_META: Array<{ key: string; label: string }> = [
  { key: 'inventory', label: 'Stock status' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'currencyPrice', label: 'Price (currency)' },
  { key: 'price', label: 'Price (CAD)' },
];

export function buildAdminVariationDisplayRows(product: Product): AdminVariationDisplayRow[] {
  const variations = product.variations ?? [];
  const attributeNames = getVariationAttributeNames(variations);
  const currency = formatAdminProductCurrencyLabel(product.currency);

  return variations.map((variation, index) => {
    const attributes = attributeNames.map((name) => ({
      label: name,
      value: variation[name] != null && variation[name] !== '' ? String(variation[name]) : '—',
    }));

    const fields = VARIATION_DISPLAY_META.map(({ key, label }) => {
      if (key === 'inventory') {
        return {
          label,
          value: formatAdminProductStockStatus(String(variation.inventory ?? '')),
        };
      }

      if (key === 'price') {
        return { label, value: formatAdminProductMoney(variation.price, 'CAD') };
      }

      if (key === 'currencyPrice') {
        return { label, value: formatAdminProductMoney(variation.currencyPrice, currency) };
      }

      const raw = variation[key];
      return {
        label,
        value: raw != null && raw !== '' ? String(raw) : '—',
      };
    });

    const attributeSummary = attributes
      .map((attribute) => attribute.value !== '—' ? attribute.value : null)
      .filter(Boolean)
      .join(' · ');

    return {
      id: `${index}-${String(variation._id ?? 'variation')}`,
      title: attributeSummary || `Variation ${index + 1}`,
      attributes,
      fields,
      imageUrl: getVariationImageUrl(variation),
    };
  });
}

export function getAdminProductApprovalFields(product: Product): Array<{ label: string; value: string }> {
  const fields: Array<{ label: string; value: string }> = [
    { label: 'Approval', value: formatAdminProductApprovalStatus(product.productStatus) },
    { label: 'Store visibility', value: formatAdminProductInventoryStatus(product.status) },
  ];

  if (product.productType !== 'Customizable') {
    fields.push({
      label: 'Stock status',
      value: formatAdminProductStockStatus(product.inventory),
    });
  }

  if (product.productType === 'Standard') {
    fields.push({ label: 'Quantity', value: formatAdminProductQuantity(product.quantity) });
  }

  return fields;
}

export function getAdminProductPricingFields(product: Product): Array<{ label: string; value: string }> {
  const currency = formatAdminProductCurrencyLabel(product.currency);
  const isCustomizable = product.productType === 'Customizable';

  const fields: Array<{ label: string; value: string }> = [
    { label: 'Currency', value: currency },
  ];

  if (!isCustomizable && currency !== 'CAD' && product.currencyPrice != null && product.currencyPrice !== '') {
    fields.push({
      label: `Price (${currency})`,
      value: formatAdminProductMoney(product.currencyPrice, currency),
    });
  }

  if (!isCustomizable) {
    fields.push({ label: 'Price (CAD)', value: formatAdminProductMoney(product.price, 'CAD') });
    fields.push({ label: 'List price', value: formatAdminProductSummaryPrice(product) });
  } else {
    fields.push({
      label: 'Starting price',
      value: formatAdminProductSummaryPrice(product),
    });
    fields.push({
      label: 'Variation prices',
      value: 'See variations section',
    });
  }

  fields.push({ label: 'Discount', value: formatAdminProductDiscount(product) });

  return fields;
}

export function getAdminProductShippingFields(product: Product): Array<{ label: string; value: string }> {
  const customShipping = hasAdminProductCustomShipping(product);

  return [
    { label: 'Harmonized code', value: product.commodityCode?.trim() || '—' },
    { label: 'Weight', value: formatAdminProductDimension(product.weight, 'kg') },
    { label: 'Length', value: formatAdminProductDimension(product.length, 'cm') },
    { label: 'Width', value: formatAdminProductDimension(product.width, 'cm') },
    { label: 'Height', value: formatAdminProductDimension(product.height, 'cm') },
    { label: 'Dispatch time', value: formatAdminProductDimension(product.dispatchDays, 'days') },
    { label: 'Custom shipping', value: formatAdminProductBoolean(customShipping) },
    { label: 'Free domestic shipping', value: formatAdminProductBoolean(product.freeDelivery) },
    {
      label: 'Handling fee',
      value: product.handlingFee != null ? formatAdminProductMoney(product.handlingFee, 'CAD') : '—',
    },
    {
      label: 'Additional item cost',
      value:
        product.additionalCost != null ? formatAdminProductMoney(product.additionalCost, 'CAD') : '—',
    },
  ];
}

export function getAdminProductSeoFields(product: Product): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Live URL',
      value: getAdminProductLiveUrl(product.slug, product._id) ?? '—',
    },
    {
      label: 'Preview URL',
      value: getAdminProductPreviewUrl(product.slug) ?? '—',
    },
    { label: 'Meta title', value: product.metaTitle?.trim() || '—' },
    { label: 'Meta keywords', value: product.metaKeywords?.trim() || '—' },
    { label: 'Meta description', value: product.metaDesc?.trim() || '—' },
  ];
}
