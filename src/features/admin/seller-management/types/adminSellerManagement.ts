export type AdminSellerApprovalStatus = 'Approved' | 'Pending' | 'Disapproved' | string;

export type AdminSellerApprovalFilter = '' | 'Approved' | 'Pending' | 'Disapproved';

/** Web API uses Active / Inactive for shopStatus query param. */
export type AdminSellerShopFilter = '' | 'Active' | 'Inactive';

export interface AdminSellerListItem {
  _id: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  DOB?: string;
  gender?: string;
  web3address?: string;
  networkType?: string;
  country?: string;
  state?: string;
  city?: string;
  countryCode?: string;
  stateCode?: string;
  status?: AdminSellerApprovalStatus;
  shop_status?: number | boolean;
  storeTitle?: string;
  storeSlug?: string;
  createdAt?: string;
  lastLogin?: string;
  referral_id?: string;
  userRole?: string;
  streetAddress?: string;
  ZipCode?: string;
  storeDesc?: string;
  storeBanner?: string;
  storeLogo?: string;
  userProfile?: string;
  slug?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  taxVatNumber?: string;
  productGallery?: string;
  paymentInfo?: Array<{
    accountHolderName?: string;
    accountNumber?: string | number;
    swiftCode?: string;
    bankName?: string;
    ibanNumber?: string;
  }>;
  storePolicy?: {
    cancellationPolicy?: boolean;
    cancellationPolicyTime?: number | string;
    returnPolicy?: boolean;
    returnPolicyDetails?: string;
    faqList?: Array<{ question?: string; answer?: string }>;
  };
}

export type AdminSellerApprovalChoice = 'Approved' | 'Pending' | 'Disapproved';

export interface AdminSellerBasicInfoFormValues {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  phone: string;
}

export interface AdminSellerListResponse {
  sellers?: AdminSellerListItem[];
  totalSellers?: number;
  totalPages?: number;
}

export interface AdminSellerListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: AdminSellerApprovalFilter;
  shopStatus?: AdminSellerShopFilter;
}

export type AdminSellerDetailSectionId =
  | 'basic-information'
  | 'address'
  | 'shop-details'
  | 'payment-information'
  | 'shop-policies';

export type AdminEditableSellerSectionId = Exclude<AdminSellerDetailSectionId, 'basic-information'>;

export interface AdminSellerDetailSection {
  id: AdminSellerDetailSectionId;
  label: string;
}

export const ADMIN_SELLER_DETAIL_SECTIONS: AdminSellerDetailSection[] = [
  { id: 'basic-information', label: 'Basic Information' },
  { id: 'address', label: 'Address' },
  { id: 'shop-details', label: 'Shop Details' },
  { id: 'payment-information', label: 'Payment Information' },
  { id: 'shop-policies', label: 'Shop Policies' },
];
