import type { SellerSetupSectionDefinition } from '../types/sellerProfile';
import { SELLER_ADDRESS_SECTION, SELLER_SETUP_SECTIONS } from './sellerSetupSections';

/** Permanent personal profile sections — reuses SellerSetupSection forms. */
export const SELLER_PERSONAL_PROFILE_SECTIONS: SellerSetupSectionDefinition[] = [
  {
    id: 'basicInfo',
    title: 'Personal details',
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
    title: 'Shop details',
    description: 'Logo, banner, store name, and description',
    setupFlag: 'sellerDetails',
  },
  {
    id: 'sellerPolicies',
    title: 'Policies & FAQs',
    description: 'Cancellation, return policies, and shop FAQs',
    setupFlag: 'sellerPolicies',
  },
  {
    id: 'paymentInfo',
    title: 'Payment information',
    description: 'Bank account details for payouts',
    setupFlag: 'paymentInfo',
  },
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
