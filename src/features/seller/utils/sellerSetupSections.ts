import type {
  SellerProfile,
  SellerProfileSetup,
  SellerSetupSectionDefinition,
  SellerSetupSectionId,
} from '../types/sellerProfile';

/** Ordered gated sections — matches web product-creation checklist priority. */
/** Business address — web onboarding step, not a profileSetup gate. */
export const SELLER_ADDRESS_SECTION: SellerSetupSectionDefinition = {
  id: 'address',
  title: 'Business Address',
  description: 'Pickup and shipping address for your shop',
};

/** Seven gated sections that control product creation. */
export const SELLER_SETUP_SECTIONS: SellerSetupSectionDefinition[] = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    description: 'Name, email, date of birth, and contact details',
    setupFlag: 'basicInfo',
  },
  {
    id: 'sellerDetails',
    title: 'Seller Details',
    description: 'Store name, description, and social links',
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
    title: 'Seller Policies',
    description: 'Cancellation and return policies',
    setupFlag: 'sellerPolicies',
  },
  {
    id: 'currency',
    title: 'Currency',
    description: 'Store currency for shipping and pricing',
    setupFlag: 'currency',
  },
  {
    id: 'domesticShipping',
    title: 'Domestic Shipping',
    description: 'Shipping options within your region',
    setupFlag: 'domesticShipping',
  },
  {
    id: 'internationalShipping',
    title: 'International Shipping',
    description: 'Shipping options for international orders',
    setupFlag: 'internationalShipping',
  },
];

export const SELLER_SETUP_SECTION_COUNT = SELLER_SETUP_SECTIONS.length;

/** Setup checklist order shown on SellerSetupScreen (address inserted after basic info). */
export const SELLER_SETUP_SCREEN_SECTIONS: SellerSetupSectionDefinition[] = [
  SELLER_SETUP_SECTIONS[0],
  SELLER_ADDRESS_SECTION,
  ...SELLER_SETUP_SECTIONS.slice(1),
];

export function isSellerAddressComplete(profile?: SellerProfile | null): boolean {
  return Boolean(
    profile?.country?.trim() &&
      profile?.streetAddress?.trim() &&
      profile?.city?.trim() &&
      profile?.state?.trim() &&
      profile?.ZipCode?.trim(),
  );
}

export function isSectionComplete(
  profileSetup: SellerProfileSetup | undefined,
  sectionId: SellerSetupSectionId,
  profile?: SellerProfile | null,
): boolean {
  if (sectionId === 'address') {
    return isSellerAddressComplete(profile);
  }

  const section = SELLER_SETUP_SECTIONS.find((item) => item.id === sectionId);
  if (!section?.setupFlag) {
    return false;
  }

  return profileSetup?.[section.setupFlag] === true;
}

export function isSetupSectionComplete(
  sectionId: SellerSetupSectionId,
  profileSetup: SellerProfileSetup | undefined,
  profile?: SellerProfile | null,
): boolean {
  return isSectionComplete(profileSetup, sectionId, profile);
}

export function countCompletedSetupSections(profileSetup?: SellerProfileSetup): number {
  return SELLER_SETUP_SECTIONS.filter(
    (section) => section.setupFlag && profileSetup?.[section.setupFlag] === true,
  ).length;
}

export function isSellerProductCreationAllowed(profileSetup?: SellerProfileSetup): boolean {
  return SELLER_SETUP_SECTIONS.every(
    (section) => section.setupFlag && profileSetup?.[section.setupFlag] === true,
  );
}

export function getFirstIncompleteSetupSection(
  profileSetup?: SellerProfileSetup,
): SellerSetupSectionId | undefined {
  return SELLER_SETUP_SECTIONS.find((section) => {
    if (!section.setupFlag) {
      return false;
    }

    return profileSetup?.[section.setupFlag] !== true;
  })?.id;
}

/** Continue-setup navigation — includes address between basic info and seller details (web parity). */
export function getContinueSetupSection(
  profile?: SellerProfile | null,
): SellerSetupSectionId | undefined {
  const profileSetup = profile?.profileSetup;

  if (
    profileSetup?.basicInfo === true &&
    !isSellerAddressComplete(profile) &&
    profileSetup?.sellerDetails !== true
  ) {
    return 'address';
  }

  return getFirstIncompleteSetupSection(profileSetup);
}

export function getSellerDisplayName(profile?: SellerProfile | null): string {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return name || profile?.storeTitle?.trim() || 'Seller';
}

export function getSellerStoreLabel(profile?: SellerProfile | null): string {
  return profile?.storeTitle?.trim() || 'Your store';
}
