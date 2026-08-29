import type { Product } from '../../../../services/types/product';
import { formatMoneyAmount, normalizeCurrencyCode } from '../../../../utils/currencyFormat';
import { buildStorefrontPreviewUrl } from '../../../../utils/storefrontUrl';
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
  formatAdminProductStockLabel,
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
  return normalizeCurrencyCode(currency);
}

export function formatAdminProductMoney(value: unknown, currency = 'CAD'): string {
  return formatMoneyAmount(value, currency);
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

export function getAdminProductMaterialsLabel(product: Product): string {
  return product.metaKeywords?.trim() || '—';
}

export function formatAdminProductDimensionsCompact(product: Product): string {
  const width = product.width;
  const height = product.height;
  const length = product.length;

  if (width == null && height == null && length == null) {
    return '—';
  }

  const formatPart = (value: unknown, suffix: string) => {
    if (value == null || value === '') {
      return null;
    }

    const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? `${parsed}${suffix}` : null;
  };

  const widthLabel = formatPart(width, '" W');
  const heightLabel = formatPart(height, '" H');
  const lengthLabel = formatPart(length, '" L');

  const parts = [widthLabel, heightLabel, lengthLabel].filter(Boolean);
  return parts.length > 0 ? parts.join(' x ') : '—';
}

export function formatAdminProductWeightDisplay(product: Product): string {
  if (product.weight == null) {
    return '—';
  }

  const parsed =
    typeof product.weight === 'number' ? product.weight : Number.parseFloat(String(product.weight));

  if (!Number.isFinite(parsed)) {
    return String(product.weight);
  }

  if (parsed >= 1) {
    return `${parsed} kg`;
  }

  return `${Math.round(parsed * 1000)} g`;
}

export function getAdminProductDescriptionSnippet(product: Product, maxLength = 160): string {
  const description = formatAdminProductDescription(product).replace(/\s+/g, ' ').trim();
  if (!description) {
    return 'No description provided.';
  }

  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength).trim()}…`;
}

export interface AdminProductDetailStatusChip {
  id: string;
  label: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export function resolveAdminProductDetailStatusChips(product: Product): AdminProductDetailStatusChip[] {
  const chips: AdminProductDetailStatusChip[] = [];
  const approval = product.productStatus?.trim();

  if (approval === 'Approved') {
    chips.push({ id: 'approved', label: 'Approved', icon: 'checkmark-circle', tone: 'success' });
  } else if (approval === 'Disapproved') {
    chips.push({ id: 'disapproved', label: 'Disapproved', icon: 'close-circle', tone: 'danger' });
  } else if (approval === 'Review') {
    chips.push({ id: 'review', label: 'In Review', icon: 'document-text-outline', tone: 'warning' });
  } else if (approval === 'Pending') {
    chips.push({ id: 'pending', label: 'Pending', icon: 'time-outline', tone: 'warning' });
  } else if (approval === 'Draft') {
    chips.push({ id: 'draft', label: 'Draft', icon: 'document-outline', tone: 'neutral' });
  } else if (approval) {
    chips.push({ id: 'approval', label: approval, icon: 'information-circle-outline', tone: 'neutral' });
  }

  if (product.status === 1) {
    chips.push({ id: 'visible', label: 'Publicly Visible', icon: 'eye-outline', tone: 'info' });
  } else if (product.status === 0) {
    chips.push({ id: 'hidden', label: 'Hidden', icon: 'eye-off-outline', tone: 'neutral' });
  }

  const stockLabel = formatAdminProductStockLabel(product);
  if (stockLabel && product.status !== 0 && approval !== 'Disapproved') {
    const lower = stockLabel.toLowerCase();
    const isAlert = lower.includes('low') || lower.includes('out');
    const countMatch = stockLabel.match(/\((\d+)\)/);
    const countOnly = stockLabel.replace(' in stock', '').trim();
    const stockChipLabel = isAlert
      ? stockLabel
      : countMatch
        ? `In Stock (${countMatch[1]})`
        : countOnly && /^\d+$/.test(countOnly)
          ? `In Stock (${countOnly})`
          : 'In Stock';

    chips.push({
      id: 'stock',
      label: stockChipLabel,
      icon: isAlert ? 'warning-outline' : 'cube-outline',
      tone: isAlert ? 'danger' : 'info',
    });
  }

  return chips;
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

function formatAdminProductShippingDimensions(product: Product): string {
  const parts = [product.length, product.width, product.height]
    .map((value) => {
      if (value == null || value === '') {
        return null;
      }

      const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
      return Number.isFinite(parsed) ? String(parsed) : null;
    })
    .filter(Boolean);

  if (parts.length === 0) {
    return '—';
  }

  return `${parts.join(' × ')} cm`;
}

export function formatAdminProductQuantity(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? String(Math.trunc(parsed)) : String(value);
}

export function getAdminProductPreviewUrl(slug?: string): string | undefined {
  return buildStorefrontPreviewUrl(slug);
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
    { label: 'Dimensions', value: formatAdminProductShippingDimensions(product) },
    { label: 'Dispatch time', value: formatAdminProductDimension(product.dispatchDays, 'days') },
    { label: 'Custom shipping', value: formatAdminProductBoolean(customShipping) },
    { label: 'Free domestic', value: formatAdminProductBoolean(product.freeDelivery) },
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
      label: 'Product URL',
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
