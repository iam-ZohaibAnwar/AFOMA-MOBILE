export interface AdminSellerAddressFormValues {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  streetAddress: string;
  city: string;
  zipCode: string;
}

export interface AdminSellerShopDetailsFormValues {
  storeTitle: string;
  storeDesc: string;
  twitter: string;
  facebook: string;
  instagram: string;
  taxVatNumber: string;
  productGallery: string;
  storeBanner: string;
  storeLogo: string;
  userProfile: string;
}

export interface AdminSellerPaymentFormValues {
  accountHolderName: string;
  accountNumber: string;
  swiftCode: string;
  bankName: string;
  ibanNumber: string;
  web3address: string;
}

export interface AdminSellerPolicyFaqEntry {
  question: string;
  answer: string;
}

export interface AdminSellerPoliciesFormValues {
  cancellationPolicy: boolean;
  cancellationPolicyTime: string;
  returnPolicy: boolean;
  returnPolicyDetails: string;
  faqList: AdminSellerPolicyFaqEntry[];
}

export type AdminSellerSectionFormValues =
  | AdminSellerAddressFormValues
  | AdminSellerShopDetailsFormValues
  | AdminSellerPaymentFormValues
  | AdminSellerPoliciesFormValues;
