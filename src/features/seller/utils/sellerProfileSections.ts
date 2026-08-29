import type { Ionicons } from '@expo/vector-icons';

import type { SellerSetupSectionDefinition, SellerSetupSectionId } from '../types/sellerProfile';
import { SELLER_ADDRESS_SECTION, SELLER_SETUP_SECTIONS } from './sellerSetupSections';

export interface SellerProfileHubGroup {
  title: string;
  sections: SellerSetupSectionDefinition[];
}

const SELLER_PROFILE_SECTION_ICONS: Record<SellerSetupSectionId, keyof typeof Ionicons.glyphMap> = {
  basicInfo: 'person-outline',
  address: 'location-outline',
  sellerDetails: 'storefront-outline',
  paymentInfo: 'card-outline',
  sellerPolicies: 'document-text-outline',
  currency: 'cash-outline',
  domesticShipping: 'home-outline',
  internationalShipping: 'airplane-outline',
};

export function getSellerProfileSectionIcon(
  sectionId: SellerSetupSectionId,
): keyof typeof Ionicons.glyphMap {
  return SELLER_PROFILE_SECTION_ICONS[sectionId];
}

/** Permanent personal profile sections — reuses SellerSetupSection forms. */
export const SELLER_PERSONAL_PROFILE_SECTIONS: SellerSetupSectionDefinition[] = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    description: 'Name, email, phone, and date of birth',
    setupFlag: 'basicInfo',
  },
  {
    ...SELLER_ADDRESS_SECTION,
    title: 'Address',
    description: 'Your business address for pickup and shipping',
  },
];

/** Permanent shop profile sections — reuses SellerSetupSection forms. */
export const SELLER_SHOP_PROFILE_SECTIONS: SellerSetupSectionDefinition[] = [
  {
    id: 'sellerDetails',
    title: 'Shop Details',
    description: 'Logo, banner, store name, and description',
    setupFlag: 'sellerDetails',
  },
  {
    id: 'paymentInfo',
    title: 'Payment Information',
    description: 'Bank account details for payouts',
    setupFlag: 'paymentInfo',
  },
  {
    id: 'sellerPolicies',
    title: 'Policies & FAQs',
    description: 'Cancellation, return policies, and shop FAQs',
    setupFlag: 'sellerPolicies',
  },
];

/** Web my-account order: personal + shop sections in one hub. */
export const SELLER_PROFILE_HUB_GROUPS: SellerProfileHubGroup[] = [
  {
    title: 'Personal',
    sections: SELLER_PERSONAL_PROFILE_SECTIONS,
  },
  {
    title: 'Shop',
    sections: SELLER_SHOP_PROFILE_SECTIONS,
  },
];

/** Selling requirements shown when any section is incomplete. */
export const SELLER_PROFILE_SETUP_LINK_SECTIONS: SellerSetupSectionDefinition[] = [
  SELLER_SETUP_SECTIONS.find((section) => section.id === 'currency')!,
  SELLER_SETUP_SECTIONS.find((section) => section.id === 'domesticShipping')!,
  SELLER_SETUP_SECTIONS.find((section) => section.id === 'internationalShipping')!,
];

/** Lookup a setup section definition by id (setup, personal, or shop profile). */
export function findSellerSectionDefinition(
  sectionId: SellerSetupSectionDefinition['id'],
): SellerSetupSectionDefinition | undefined {
  return (
    SELLER_PERSONAL_PROFILE_SECTIONS.find((section) => section.id === sectionId) ??
    SELLER_SHOP_PROFILE_SECTIONS.find((section) => section.id === sectionId) ??
    SELLER_SETUP_SECTIONS.find((section) => section.id === sectionId) ??
    (sectionId === 'address' ? SELLER_ADDRESS_SECTION : undefined)
  );
}
