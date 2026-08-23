import type {
  FlatRateOptionsForm,
  HandDeliveryOptionsForm,
  SaveSellerShippingConfigRequest,
  SellerShippingConfig,
  SellerShippingFormState,
  SellerShippingRegionOptions,
  ShippingRegionFormState,
  ShippingScope,
  ShippingValidationResult,
} from '../types/sellerShipping';

function emptyFlatRateOptions(): FlatRateOptionsForm {
  return {
    free_shipping: false,
    is_flat_rate: false,
    flat_rate_rate: '',
    additional_cost: '',
    is_flat_weighted: false,
    flat_rate_0_1: '',
    flat_rate_1_5: '',
    flat_rate_5_A: '',
  };
}

function emptyHandDeliveryOptions(): HandDeliveryOptionsForm {
  return {
    free_delivery: false,
    fee_rate: '',
  };
}

export function emptyShippingRegionFormState(): ShippingRegionFormState {
  return {
    afoma_shipping: false,
    flat_rate: false,
    flat_rate_options: emptyFlatRateOptions(),
    hand_delivery: false,
    hand_delivery_options: emptyHandDeliveryOptions(),
  };
}

export function emptySellerShippingFormState(): SellerShippingFormState {
  return {
    currency: 'cad',
    domestic: emptyShippingRegionFormState(),
    international: emptyShippingRegionFormState(),
  };
}

function safeToDisplayNumber(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return '';
  }

  return String(Number(value.toFixed(2)));
}

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(/,/g, '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function regionFromApi(
  region?: SellerShippingRegionOptions,
  conversionRate = 1,
): ShippingRegionFormState {
  const rate = Number(conversionRate) || 1;
  const flatOptions = region?.flat_rate_options;
  const handOptions = region?.hand_delivery_options;

  return {
    afoma_shipping: region?.afoma_shipping === true,
    flat_rate: region?.flat_rate === true,
    flat_rate_options: {
      free_shipping: flatOptions?.free_shipping === true,
      is_flat_rate: flatOptions?.is_flat_rate === true,
      flat_rate_rate: safeToDisplayNumber(
        flatOptions?.flat_rate_rate != null ? Number(flatOptions.flat_rate_rate) / rate : null,
      ),
      additional_cost: safeToDisplayNumber(
        flatOptions?.additional_cost != null ? Number(flatOptions.additional_cost) / rate : null,
      ),
      is_flat_weighted: flatOptions?.is_flat_weighted === true,
      flat_rate_0_1: safeToDisplayNumber(
        flatOptions?.flat_rate_0_1 != null ? Number(flatOptions.flat_rate_0_1) / rate : null,
      ),
      flat_rate_1_5: safeToDisplayNumber(
        flatOptions?.flat_rate_1_5 != null ? Number(flatOptions.flat_rate_1_5) / rate : null,
      ),
      flat_rate_5_A: safeToDisplayNumber(
        flatOptions?.flat_rate_5_A != null ? Number(flatOptions.flat_rate_5_A) / rate : null,
      ),
    },
    hand_delivery: region?.hand_delivery === true,
    hand_delivery_options: {
      free_delivery: handOptions?.free_delivery === true,
      fee_rate: safeToDisplayNumber(
        handOptions?.fee_rate != null ? Number(handOptions.fee_rate) / rate : null,
      ),
    },
  };
}

export function shippingConfigToFormState(config?: SellerShippingConfig | null): SellerShippingFormState {
  if (!config) {
    return emptySellerShippingFormState();
  }

  const conversionRate = Number(config.conversion_rate) || 1;

  return {
    currency: config.currency?.trim().toLowerCase() || 'cad',
    domestic: regionFromApi(config.domestic, conversionRate),
    international: regionFromApi(config.international, conversionRate),
  };
}

export function isFlatRateConfigured(options: FlatRateOptionsForm): boolean {
  if (options.free_shipping) {
    return true;
  }

  if (options.is_flat_rate) {
    return (
      parsePositiveNumber(options.flat_rate_rate) != null &&
      parsePositiveNumber(options.additional_cost) != null
    );
  }

  if (options.is_flat_weighted) {
    return (
      parsePositiveNumber(options.flat_rate_0_1) != null &&
      parsePositiveNumber(options.flat_rate_1_5) != null &&
      parsePositiveNumber(options.flat_rate_5_A) != null
    );
  }

  return false;
}

export function isHandDeliveryConfigured(options: HandDeliveryOptionsForm): boolean {
  if (options.free_delivery) {
    return true;
  }

  return parsePositiveNumber(options.fee_rate) != null;
}

export function isRegionMethodEnabled(region: ShippingRegionFormState): boolean {
  return region.afoma_shipping || region.flat_rate || region.hand_delivery;
}

export function isRegionFullyConfigured(region: ShippingRegionFormState): boolean {
  if (!isRegionMethodEnabled(region)) {
    return false;
  }

  if (region.flat_rate && !isFlatRateConfigured(region.flat_rate_options)) {
    return false;
  }

  if (region.hand_delivery && !isHandDeliveryConfigured(region.hand_delivery_options)) {
    return false;
  }

  return true;
}

function validateFlatRateOptions(options: FlatRateOptionsForm): string | null {
  if (options.free_shipping) {
    return null;
  }

  if (options.is_flat_rate) {
    if (parsePositiveNumber(options.flat_rate_rate) == null) {
      return 'Enter a fixed shipping rate.';
    }

    if (parsePositiveNumber(options.additional_cost) == null) {
      return 'Enter an additional item cost.';
    }

    return null;
  }

  if (options.is_flat_weighted) {
    if (parsePositiveNumber(options.flat_rate_0_1) == null) {
      return 'Enter the 0–1 kg rate.';
    }

    if (parsePositiveNumber(options.flat_rate_1_5) == null) {
      return 'Enter the 1–5 kg rate.';
    }

    if (parsePositiveNumber(options.flat_rate_5_A) == null) {
      return 'Enter the 5+ kg rate.';
    }

    return null;
  }

  return 'Choose free shipping, fixed rate, or weighted rates.';
}

function validateRegion(region: ShippingRegionFormState, scope: ShippingScope): string | null {
  if (!isRegionMethodEnabled(region)) {
    return `Enable at least one ${scope} shipping method.`;
  }

  if (region.flat_rate) {
    const flatRateError = validateFlatRateOptions(region.flat_rate_options);
    if (flatRateError) {
      return flatRateError;
    }
  }

  if (region.hand_delivery && !isHandDeliveryConfigured(region.hand_delivery_options)) {
    return 'Configure hand delivery as free or enter a delivery fee.';
  }

  return null;
}

export function validateShippingForm(
  form: SellerShippingFormState,
  countryCode?: string,
): ShippingValidationResult {
  if (!form.currency.trim()) {
    return { valid: false, message: 'Select a store currency.' };
  }

  const normalizedCountry = countryCode?.trim().toUpperCase();
  if (
    form.domestic.afoma_shipping &&
    normalizedCountry &&
    !['CA', 'US'].includes(normalizedCountry)
  ) {
    return {
      valid: false,
      message: 'Domestic AFOMA Shipping is only available for sellers in Canada or the United States.',
    };
  }

  if (
    form.international.afoma_shipping &&
    (form.international.flat_rate || form.international.hand_delivery)
  ) {
    return {
      valid: false,
      message: 'International AFOMA Shipping cannot be combined with flat rate or hand delivery.',
    };
  }

  const domesticError = validateRegion(form.domestic, 'domestic');
  if (domesticError) {
    return { valid: false, message: domesticError, domesticError };
  }

  const internationalError = validateRegion(form.international, 'international');
  if (internationalError) {
    return { valid: false, message: internationalError, internationalError };
  }

  return { valid: true };
}

function normalizeFlatRateOptionsForSave(
  region: ShippingRegionFormState,
  conversionRate: number,
): SellerShippingRegionOptions['flat_rate_options'] {
  if (!region.flat_rate) {
    return {
      free_shipping: false,
      is_flat_rate: false,
      flat_rate_rate: null,
      additional_cost: null,
      is_flat_weighted: false,
      flat_rate_0_1: null,
      flat_rate_1_5: null,
      flat_rate_5_A: null,
    };
  }

  const options = region.flat_rate_options;

  if (options.free_shipping) {
    return {
      free_shipping: true,
      is_flat_rate: false,
      flat_rate_rate: null,
      additional_cost: null,
      is_flat_weighted: false,
      flat_rate_0_1: null,
      flat_rate_1_5: null,
      flat_rate_5_A: null,
    };
  }

  if (options.is_flat_rate) {
    return {
      free_shipping: false,
      is_flat_rate: true,
      flat_rate_rate:
        parsePositiveNumber(options.flat_rate_rate)! * conversionRate,
      additional_cost:
        parsePositiveNumber(options.additional_cost)! * conversionRate,
      is_flat_weighted: false,
      flat_rate_0_1: null,
      flat_rate_1_5: null,
      flat_rate_5_A: null,
    };
  }

  return {
    free_shipping: false,
    is_flat_rate: false,
    flat_rate_rate: null,
    additional_cost: null,
    is_flat_weighted: true,
    flat_rate_0_1: parsePositiveNumber(options.flat_rate_0_1)! * conversionRate,
    flat_rate_1_5: parsePositiveNumber(options.flat_rate_1_5)! * conversionRate,
    flat_rate_5_A: parsePositiveNumber(options.flat_rate_5_A)! * conversionRate,
  };
}

function normalizeHandDeliveryOptionsForSave(
  region: ShippingRegionFormState,
  conversionRate: number,
): SellerShippingRegionOptions['hand_delivery_options'] {
  if (!region.hand_delivery) {
    return {
      free_delivery: false,
      fee_rate: null,
    };
  }

  if (region.hand_delivery_options.free_delivery) {
    return {
      free_delivery: true,
      fee_rate: null,
    };
  }

  return {
    free_delivery: false,
    fee_rate: parsePositiveNumber(region.hand_delivery_options.fee_rate)! * conversionRate,
  };
}

function normalizeRegionForSave(
  region: ShippingRegionFormState,
  scope: ShippingScope,
  conversionRate: number,
): SellerShippingRegionOptions {
  if (scope === 'international' && region.afoma_shipping) {
    return {
      flat_rate: false,
      afoma_shipping: true,
      hand_delivery: false,
      hand_delivery_options: {
        free_delivery: false,
        fee_rate: null,
      },
      flat_rate_options: {
        free_shipping: false,
        is_flat_rate: false,
        flat_rate_rate: null,
        additional_cost: null,
        is_flat_weighted: false,
        flat_rate_0_1: null,
        flat_rate_1_5: null,
        flat_rate_5_A: null,
      },
    };
  }

  return {
    flat_rate: region.flat_rate,
    afoma_shipping: region.afoma_shipping,
    hand_delivery: region.hand_delivery,
    flat_rate_options: normalizeFlatRateOptionsForSave(region, conversionRate),
    hand_delivery_options: normalizeHandDeliveryOptionsForSave(region, conversionRate),
  };
}

export function buildShippingSavePayload(params: {
  form: SellerShippingFormState;
  sellerId: string;
  existingConfig?: SellerShippingConfig | null;
  conversionRateCad: number;
  includeProfileSetup?: boolean;
}): SaveSellerShippingConfigRequest {
  const conversionRate = params.conversionRateCad || 1;
  const domestic = normalizeRegionForSave(params.form.domestic, 'domestic', conversionRate);
  const international = normalizeRegionForSave(
    params.form.international,
    'international',
    conversionRate,
  );

  const payload: SaveSellerShippingConfigRequest = {
    _id: params.existingConfig?._id,
    sellerId: params.sellerId,
    currency: params.form.currency.trim().toLowerCase(),
    conversion_rate: conversionRate,
    domestic,
    international,
  };

  if (params.includeProfileSetup !== false) {
    const profileSetup: SaveSellerShippingConfigRequest['profileSetup'] = {};

    if (params.form.currency.trim()) {
      profileSetup.currency = true;
    }

    profileSetup.domesticShipping = isRegionFullyConfigured(params.form.domestic);
    profileSetup.internationalShipping = isRegionFullyConfigured(params.form.international);
    payload.profileSetup = profileSetup;
  }

  return payload;
}

export async function fetchCurrencyToCadRate(currency: string): Promise<number> {
  const normalized = currency.trim().toLowerCase();
  if (!normalized || normalized === 'cad') {
    return 1;
  }

  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${normalized}.json`,
  );

  if (!response.ok) {
    throw new Error('Unable to fetch currency conversion rate.');
  }

  const data = (await response.json()) as Record<string, Record<string, number>>;
  const rate = data[normalized]?.cad;

  if (!rate || !Number.isFinite(rate)) {
    throw new Error('Currency conversion rate unavailable.');
  }

  return rate;
}

export function getFlatRateSummary(options: FlatRateOptionsForm, currency: string): string {
  const code = currency.toUpperCase();

  if (options.free_shipping) {
    return 'Free shipping';
  }

  if (options.is_flat_rate) {
    const rate = options.flat_rate_rate.trim();
    const additional = options.additional_cost.trim();
    if (rate && additional) {
      return `${code} ${rate} + ${additional} per item`;
    }

    return 'Fixed rate';
  }

  if (options.is_flat_weighted) {
    if (options.flat_rate_0_1 && options.flat_rate_1_5 && options.flat_rate_5_A) {
      return `Weighted: ${options.flat_rate_0_1} / ${options.flat_rate_1_5} / ${options.flat_rate_5_A} ${code}`;
    }

    return 'Weighted rates';
  }

  return 'Configure';
}

export function getHandDeliverySummary(options: HandDeliveryOptionsForm, currency: string): string {
  if (options.free_delivery) {
    return 'Free delivery';
  }

  if (options.fee_rate.trim()) {
    return `${currency.toUpperCase()} ${options.fee_rate.trim()}`;
  }

  return 'Configure';
}

export function applyInternationalAfomaExclusivity(
  region: ShippingRegionFormState,
  afomaEnabled: boolean,
): ShippingRegionFormState {
  if (!afomaEnabled) {
    return { ...region, afoma_shipping: false };
  }

  return {
    ...region,
    afoma_shipping: true,
    flat_rate: false,
    hand_delivery: false,
    flat_rate_options: emptyFlatRateOptions(),
    hand_delivery_options: emptyHandDeliveryOptions(),
  };
}

export function applyInternationalSellerManagedToggle(
  region: ShippingRegionFormState,
  patch: Partial<ShippingRegionFormState>,
): ShippingRegionFormState {
  const next = { ...region, ...patch };

  if (next.flat_rate || next.hand_delivery) {
    next.afoma_shipping = false;
  }

  return next;
}

/** Currency-only save from Seller Setup — does not mark shipping regions complete. */
export function buildCurrencyOnlySavePayload(params: {
  currency: string;
  sellerId: string;
  existingConfig?: SellerShippingConfig | null;
  conversionRateCad: number;
}): SaveSellerShippingConfigRequest {
  const existingForm = shippingConfigToFormState(params.existingConfig);
  existingForm.currency = params.currency.trim().toLowerCase();

  const payload = buildShippingSavePayload({
    form: existingForm,
    sellerId: params.sellerId,
    existingConfig: params.existingConfig,
    conversionRateCad: params.conversionRateCad,
  });

  return {
    ...payload,
    profileSetup: {
      currency: true,
      domesticShipping: isRegionFullyConfigured(existingForm.domestic),
      internationalShipping: isRegionFullyConfigured(existingForm.international),
    },
  };
}

export const SHIPPING_CURRENCY_OPTIONS = [
  { label: 'CAD — Canadian Dollar', value: 'cad' },
  { label: 'USD — US Dollar', value: 'usd' },
  { label: 'EUR — Euro', value: 'eur' },
  { label: 'GBP — British Pound', value: 'gbp' },
];
