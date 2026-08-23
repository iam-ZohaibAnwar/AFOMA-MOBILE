/** Seven backend `profileSetup` flags that gate product creation (web-verified). */
export interface SellerProfileSetup {
  basicInfo?: boolean;
  sellerDetails?: boolean;
  sellerPolicies?: boolean;
  paymentInfo?: boolean;
  currency?: boolean;
  domesticShipping?: boolean;
  internationalShipping?: boolean;
}

export interface SellerPaymentInfo {
  accountHolderName?: string;
  accountNumber?: string | number;
  swiftCode?: string;
  bankName?: string;
  ibanNumber?: string;
  productStatus?: string;
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

export interface SellerProfile {
  _id?: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  DOB?: string;
  gender?: string;
  phone?: string;
  web3address?: string;
  networkType?: string;
  status?: string;
  country?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  countryCode?: string;
  ZipCode?: string;
  storeTitle?: string;
  storeDesc?: string;
  storeBanner?: string;
  storeLogo?: string;
  userProfile?: string;
  slug?: string;
  storeSlug?: string;
  shop_status?: number | boolean;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  taxVatNumber?: string;
  productGallery?: string;
  paymentInfo?: SellerPaymentInfo[];
  storePolicy?: {
    cancellationPolicy?: boolean;
    cancellationPolicyTime?: number | string;
    returnPolicy?: boolean;
    returnPolicyDetails?: string;
    faqList?: Array<{ question?: string; answer?: string }>;
  };
  profileSetup?: SellerProfileSetup;
  shippingConfigId?: SellerShippingConfig;
}

export type SellerSetupSectionId =
  | 'basicInfo'
  | 'address'
  | 'sellerDetails'
  | 'paymentInfo'
  | 'sellerPolicies'
  | 'currency'
  | 'domesticShipping'
  | 'internationalShipping';

export interface SellerSetupSectionDefinition {
  id: SellerSetupSectionId;
  title: string;
  description: string;
  /** Omitted for non-gated steps such as business address. */
  setupFlag?: keyof SellerProfileSetup;
}
