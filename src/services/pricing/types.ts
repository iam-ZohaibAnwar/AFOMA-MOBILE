export interface UserPricingInfo {
  ip?: string;
  country?: string;
  currency?: string;
  currencyRate?: number;
  surCharge?: Record<string, number>;
}

export interface GeoLookupResult {
  ip: string;
  country: string;
  currency: string;
}
