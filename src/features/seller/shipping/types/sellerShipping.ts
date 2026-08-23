export const AFOMA_DOMESTIC_SHIPPING_COUNTRIES = ['CA', 'US'] as const;

export type ShippingScope = 'domestic' | 'international';

export interface FlatRateOptionsForm {
  free_shipping: boolean;
  is_flat_rate: boolean;
  flat_rate_rate: string;
  additional_cost: string;
  is_flat_weighted: boolean;
  flat_rate_0_1: string;
  flat_rate_1_5: string;
  flat_rate_5_A: string;
}

export interface HandDeliveryOptionsForm {
  free_delivery: boolean;
  fee_rate: string;
}

export interface ShippingRegionFormState {
  afoma_shipping: boolean;
  flat_rate: boolean;
  flat_rate_options: FlatRateOptionsForm;
  hand_delivery: boolean;
  hand_delivery_options: HandDeliveryOptionsForm;
}

export interface SellerShippingFormState {
  currency: string;
  domestic: ShippingRegionFormState;
  international: ShippingRegionFormState;
}

export interface SellerShippingRegionOptions {
  flat_rate?: boolean;
  afoma_shipping?: boolean;
  hand_delivery?: boolean;
  hand_delivery_options?: {
    free_delivery?: boolean;
    fee_rate?: number | null;
  };
  flat_rate_options?: {
    free_shipping?: boolean;
    is_flat_rate?: boolean;
    flat_rate_rate?: number | null;
    additional_cost?: number | null;
    is_flat_weighted?: boolean;
    flat_rate_0_1?: number | null;
    flat_rate_1_5?: number | null;
    flat_rate_5_A?: number | null;
  };
}

export interface SellerShippingConfig {
  _id?: string;
  sellerId?: string;
  currency?: string;
  conversion_rate?: number | string;
  domestic?: SellerShippingRegionOptions;
  international?: SellerShippingRegionOptions;
}

export interface SaveSellerShippingConfigRequest {
  _id?: string;
  sellerId: string;
  currency?: string;
  conversion_rate?: number | string;
  domestic?: SellerShippingRegionOptions;
  international?: SellerShippingRegionOptions;
  profileSetup?: {
    currency?: boolean;
    domesticShipping?: boolean;
    internationalShipping?: boolean;
  };
}

export interface ShippingValidationResult {
  valid: boolean;
  message?: string;
  domesticError?: string;
  internationalError?: string;
}
