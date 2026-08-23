import type { Product, ProductVariation } from '../types/product';
import type { UserPricingInfo } from './types';

/**
 * Ported from web `utils/pricingUtils.js`.
 * Derives list/compare-at from sale price when discount percent is known.
 */
export function compareAtWithDiscountFallback(
  sale: number | undefined,
  compareAt: number | undefined,
  discountPct: number | undefined,
): number | undefined {
  const base = Number(sale);
  let cmp = Number(compareAt);
  const pct = Number(discountPct);

  if (!Number.isFinite(base) || base <= 0) {
    return Number.isFinite(cmp) ? cmp : undefined;
  }

  if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
    return Number.isFinite(cmp) ? cmp : undefined;
  }

  if (Number.isFinite(cmp) && cmp > base + 0.009) {
    return cmp;
  }

  return Math.round((base / (1 - pct / 100)) * 100) / 100;
}

function resolveUserCountry(userInfo: UserPricingInfo): string {
  const rawCountry = userInfo.country;
  if (typeof rawCountry === 'string') {
    return rawCountry.trim();
  }

  return '';
}

function applyPricingToStandardProduct(
  data: Product,
  userInfo: UserPricingInfo,
): Product {
  const seller = data.seller;
  if (!seller) {
    return data;
  }

  const userCountry = resolveUserCountry(userInfo);
  const userSurcharge = userInfo.surCharge ?? {};
  const conversionRate = parseFloat(String(userInfo.currencyRate ?? 1)) || 1;
  const sellerCountry = seller.country?.trim() ?? '';
  const shippingConfig = (seller.shippingConfigId ?? {}) as Record<string, any>;
  const isDomestic = sellerCountry === userCountry;
  const configApply = isDomestic ? shippingConfig.domestic : shippingConfig.international;

  const isShippingEnabled = configApply?.afoma_shipping;
  const isFreeShipping =
    configApply?.flat_rate && configApply?.flat_rate_options?.free_shipping;

  let surchargeValue = 0;
  if (
    data.productType !== 'Downloadable' &&
    isShippingEnabled &&
    !isDomestic &&
    !isFreeShipping
  ) {
    surchargeValue = userSurcharge[`${sellerCountry}-${userCountry}`] ?? 0;
  }

  let handlingFee = 0;
  if (
    configApply?.flat_rate &&
    configApply?.flat_rate_options?.free_shipping &&
    data.productType !== 'Downloadable'
  ) {
    const flatRateOptions = configApply.flat_rate_options;
    const weight = data.weight ?? 0;
    handlingFee = flatRateOptions?.is_flat_rate
      ? flatRateOptions?.flat_rate_rate
      : weight <= 1
        ? flatRateOptions?.flat_rate_0_1
        : weight <= 5
          ? flatRateOptions?.flat_rate_1_5
          : flatRateOptions?.flat_rate_5_A;
  }

  if (data.freeDelivery && sellerCountry === userCountry) {
    handlingFee = parseFloat(String(data.handlingFee ?? 0)) || 0;
  }

  const basePrice = parseFloat(String(data.price ?? 0)) || 0;
  const discountCode = parseFloat(String(data.discountCode ?? 0)) || 0;
  const discountFactor = discountCode ? 1 - discountCode / 100 : 1;
  const discountedAmount = basePrice * discountFactor;
  const amountWithSurcharge = parseFloat(
    (discountedAmount + surchargeValue + handlingFee).toFixed(2),
  );

  const next: Product = { ...data };

  if (data.productType === 'Standard') {
    next.finalPrice = parseFloat((discountedAmount + handlingFee).toFixed(2));
    next.surTotalAmount = parseFloat(String(amountWithSurcharge * conversionRate));
    next.surTotalAmountBDis = discountCode
      ? parseFloat(String((amountWithSurcharge / discountFactor) * conversionRate))
      : next.surTotalAmount;
  }

  if (data.productType === 'Downloadable') {
    next.surTotalAmount = parseFloat(String(discountedAmount * conversionRate));
    next.surTotalAmountBDis = discountCode
      ? parseFloat(String((discountedAmount / discountFactor) * conversionRate))
      : next.surTotalAmount;
  }

  if (data.productType === 'Customizable' && Array.isArray(data.variations)) {
    next.variations = data.variations.map((variation) =>
      applyPricingToVariation(variation, {
        discountFactor,
        discountCode,
        surchargeValue,
        handlingFee,
        conversionRate,
      }),
    );
  }

  return next;
}

function applyPricingToVariation(
  variation: ProductVariation,
  params: {
    discountFactor: number;
    discountCode: number;
    surchargeValue: number;
    handlingFee: number;
    conversionRate: number;
  },
): ProductVariation {
  const variationPrice = parseFloat(String(variation.price ?? 0)) || 0;
  const varDiscountedAmount = variationPrice * params.discountFactor;
  const varAmountWithSurcharge = parseFloat(
    (varDiscountedAmount + params.surchargeValue + params.handlingFee).toFixed(2),
  );

  return {
    ...variation,
    finalPrice: parseFloat((varDiscountedAmount + params.handlingFee).toFixed(2)),
    surTotalAmount: parseFloat(String(varAmountWithSurcharge * params.conversionRate)),
    surTotalAmountBDis: params.discountCode
      ? parseFloat(String((varAmountWithSurcharge / params.discountFactor) * params.conversionRate))
      : parseFloat(String(varAmountWithSurcharge * params.conversionRate)),
  };
}

export function calculateSurcharge(
  products: Product[],
  userInfo: UserPricingInfo = {},
): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map((product) => applyPricingToStandardProduct({ ...product }, userInfo));
}

export function cloneProductsForPricing<T extends Product>(products: T[]): T[] {
  return products.map((product) => ({
    ...product,
    variations: product.variations ? product.variations.map((variation) => ({ ...variation })) : product.variations,
  })) as T[];
}
