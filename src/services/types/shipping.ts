import type { CartMap } from './cart';

/**
 * Shipping types from cart rate quote and PDP estimate flows.
 * TODO: Verify full rateObj item schema from POST /shipping/getRate.
 */
export interface ShippingUserInfo {
  firstName?: string;
  lastName?: string;
  fname?: string;
  lname?: string;
  email?: string;
  company?: string;
  country?: string;
  state?: string;
  countryCode?: string;
  stateCode?: string;
  city?: string;
  streetAddress?: string;
  zipcode?: string;
  ZipCode?: string;
  moNumber?: string;
  information?: string;
  shippingMethod?: string;
  accesstoken?: string;
}

export interface GetShippingRateRequest {
  cart: unknown;
  userInfo: ShippingUserInfo;
  userCountry?: string;
}

export interface ShippingRateOption {
  service_id?: string | number;
  rate?: number;
  currency?: string;
  carrier_name?: string;
  service_name?: string;
}

export interface GetShippingRateResponse {
  rateObj?: ShippingRateOption[];
}

export interface ProductShippingEstimateRequest {
  seller: string;
  destinationCountry: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  price?: number | string;
  dispatchDays?: number | string;
}

export interface ProductShippingDestination {
  code: string;
  name: string;
}

export interface ProductShippingDestinationsResponse {
  destinations?: ProductShippingDestination[];
}

export interface ProductShippingEstimateCarrierResult {
  countryName?: string;
  productPriceCad?: number | string;
  shippingCostCad?: number | string;
  serviceName?: string;
  carrierName?: string;
  error?: string;
}

export interface ProductShippingEstimateResponse {
  estimate?: ProductShippingEstimateCarrierResult | null;
  freightComEstimate?: ProductShippingEstimateCarrierResult | null;
}

export interface UserSurchargeResponse {
  [key: string]: unknown;
}
