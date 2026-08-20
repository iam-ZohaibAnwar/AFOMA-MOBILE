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
  moNumber?: string;
  phone?: string;
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
}

export interface UserSurchargeResponse {
  // TODO: Verify surcharge map structure from GET /shipping-config/user-surcharge
  [key: string]: unknown;
}

export type ProductShippingDestinationsResponse = unknown;

export type ProductShippingEstimateResponse = unknown;
