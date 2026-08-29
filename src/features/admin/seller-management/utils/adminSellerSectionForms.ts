import { createCountryStateSelection } from '../../../../utils/regionOptions';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../types/adminSellerManagement';
import type {
  AdminSellerAddressFormValues,
  AdminSellerPaymentFormValues,
  AdminSellerPoliciesFormValues,
  AdminSellerSectionFormValues,
  AdminSellerShopDetailsFormValues,
} from '../types/adminSellerSections';

const NUMBERS_PATTERN = /^[0-9]+$/;
const ALPHANUMERIC_PATTERN = /^[0-9a-zA-Z]+$/;

function toTrimmedString(value: unknown): string {
  if (value == null || value === '') return '';
  return String(value).trim();
}

export const ADMIN_RETURN_POLICY_OPTIONS = [
  { label: 'No Returns – All sales are final.', value: 'No Returns – All sales are final.' },
  {
    label: '7-Day Returns – Return within 7 days. Buyer covers shipping.',
    value: '7-Day Returns – Return within 7 days. Buyer covers shipping.',
  },
  {
    label: '14-Day Returns – Return within 14 days. Buyer covers shipping unless defective.',
    value: '14-Day Returns – Return within 14 days. Buyer covers shipping unless defective.',
  },
  {
    label: '30-Day Returns – Return within 30 days. Unused, original packaging. Buyer covers shipping.',
    value: '30-Day Returns – Return within 30 days. Unused, original packaging. Buyer covers shipping.',
  },
  {
    label: 'Exchanges Only – No returns, but exchanges allowed for defects within 14 days.',
    value: 'Exchanges Only – No returns, but exchanges allowed for defects within 14 days.',
  },
  {
    label: 'Damaged/Incorrect Items Only – Returns accepted within 7 days for damaged or wrong items.',
    value: 'Damaged/Incorrect Items Only – Returns accepted within 7 days for damaged or wrong items.',
  },
  {
    label: 'Customized – Enter your own return policy details.',
    value: 'Customized – Enter your own return policy details.',
  },
];

export const ADMIN_CANCELLATION_TIME_OPTIONS = [
  { label: '24 hours', value: '24' },
  { label: '48 hours', value: '48' },
];

export function getAdminSellerSectionTitle(sectionId: AdminEditableSellerSectionId): string {
  switch (sectionId) {
    case 'address':
      return 'Address';
    case 'shop-details':
      return 'Shop Details';
    case 'payment-information':
      return 'Payment Information';
    case 'shop-policies':
      return 'Shop Policies';
    default:
      return 'Seller Section';
  }
}

export function adminSectionFormFromSeller(
  sectionId: AdminEditableSellerSectionId,
  seller?: AdminSellerListItem | null,
): AdminSellerSectionFormValues {
  switch (sectionId) {
    case 'address': {
      const selection = createCountryStateSelection(seller?.country ?? '', seller?.state ?? '', {
        countryCode: seller?.countryCode,
        stateCode: seller?.stateCode,
      });

      return {
        country: selection.country,
        countryCode: selection.countryCode,
        state: selection.state,
        stateCode: selection.stateCode,
        streetAddress: seller?.streetAddress?.trim() ?? '',
        city: seller?.city?.trim() ?? '',
        zipCode: seller?.ZipCode?.trim() ?? '',
      } satisfies AdminSellerAddressFormValues;
    }
    case 'shop-details':
      return {
        storeTitle: seller?.storeTitle?.trim() ?? '',
        storeDesc: seller?.storeDesc?.trim() ?? '',
        twitter: seller?.twitter?.trim() ?? '',
        facebook: seller?.facebook?.trim() ?? '',
        instagram: seller?.instagram?.trim() ?? '',
        taxVatNumber: seller?.taxVatNumber?.trim() ?? '',
        productGallery: seller?.productGallery?.trim() ?? '',
        storeBanner: seller?.storeBanner?.trim() ?? '',
        storeLogo: seller?.storeLogo?.trim() ?? '',
        userProfile: seller?.userProfile?.trim() ?? '',
      } satisfies AdminSellerShopDetailsFormValues;
    case 'payment-information': {
      const payment = seller?.paymentInfo?.[0];
      return {
        accountHolderName: toTrimmedString(payment?.accountHolderName),
        accountNumber: toTrimmedString(payment?.accountNumber),
        swiftCode: toTrimmedString(payment?.swiftCode),
        bankName: toTrimmedString(payment?.bankName),
        ibanNumber: toTrimmedString(payment?.ibanNumber),
        web3address: seller?.web3address?.trim() ?? '',
      } satisfies AdminSellerPaymentFormValues;
    }
    case 'shop-policies': {
      const faqList = Array.isArray(seller?.storePolicy?.faqList)
        ? seller.storePolicy.faqList
            .map((entry) => ({
              question: entry.question?.trim() ?? '',
              answer: entry.answer?.trim() ?? '',
            }))
            .filter((entry) => entry.question || entry.answer)
        : [];

      return {
        cancellationPolicy: seller?.storePolicy?.cancellationPolicy === true,
        cancellationPolicyTime: String(seller?.storePolicy?.cancellationPolicyTime ?? ''),
        returnPolicy: seller?.storePolicy?.returnPolicy === true,
        returnPolicyDetails: seller?.storePolicy?.returnPolicyDetails?.trim() ?? '',
        faqList,
      } satisfies AdminSellerPoliciesFormValues;
    }
    default:
      return {
        country: '',
        countryCode: '',
        state: '',
        stateCode: '',
        streetAddress: '',
        city: '',
        zipCode: '',
      } satisfies AdminSellerAddressFormValues;
  }
}

export function validateAdminSellerSectionForm(
  sectionId: AdminEditableSellerSectionId,
  values: AdminSellerSectionFormValues,
): Record<string, string> {
  switch (sectionId) {
    case 'address': {
      const form = values as AdminSellerAddressFormValues;
      const errors: Record<string, string> = {};
      if (!form.country.trim()) errors.country = 'Required';
      if (!form.state.trim()) errors.state = 'Required';
      if (!form.streetAddress.trim()) errors.streetAddress = 'Required';
      if (!form.city.trim()) errors.city = 'Required';
      if (!form.zipCode.trim()) errors.zipCode = 'Required';
      return errors;
    }
    case 'shop-details': {
      const form = values as AdminSellerShopDetailsFormValues;
      const errors: Record<string, string> = {};
      if (form.taxVatNumber && !NUMBERS_PATTERN.test(form.taxVatNumber.trim())) {
        errors.taxVatNumber = 'Numbers only';
      }
      return errors;
    }
    case 'payment-information': {
      const form = values as AdminSellerPaymentFormValues;
      const errors: Record<string, string> = {};
      if (!form.accountHolderName.trim()) errors.accountHolderName = 'Required';
      if (!form.accountNumber.trim()) errors.accountNumber = 'Required';
      else if (!NUMBERS_PATTERN.test(form.accountNumber.trim())) errors.accountNumber = 'Numbers only';
      if (form.swiftCode && !ALPHANUMERIC_PATTERN.test(form.swiftCode.trim())) {
        errors.swiftCode = 'Alphanumeric only';
      }
      if (form.ibanNumber && !ALPHANUMERIC_PATTERN.test(form.ibanNumber.trim())) {
        errors.ibanNumber = 'Alphanumeric only';
      }
      return errors;
    }
    case 'shop-policies': {
      const form = values as AdminSellerPoliciesFormValues;
      const errors: Record<string, string> = {};
      if (form.cancellationPolicy && !form.cancellationPolicyTime.trim()) {
        errors.cancellationPolicyTime = 'Required when cancellation policy is enabled';
      }
      if (form.returnPolicy && !form.returnPolicyDetails.trim()) {
        errors.returnPolicyDetails = 'Required when return policy is enabled';
      }
      return errors;
    }
    default:
      return {};
  }
}

/** Admin section PUT payloads — never include approval/status fields. */
export function buildAdminSellerSectionPayload(
  sectionId: AdminEditableSellerSectionId,
  values: AdminSellerSectionFormValues,
  seller?: AdminSellerListItem | null,
): Record<string, unknown> {
  switch (sectionId) {
    case 'address': {
      const form = values as AdminSellerAddressFormValues;
      return {
        country: form.country.trim(),
        countryCode: form.countryCode.trim() || undefined,
        state: form.state.trim(),
        stateCode: form.stateCode.trim() || undefined,
        streetAddress: form.streetAddress.trim(),
        city: form.city.trim(),
        ZipCode: form.zipCode.trim(),
      };
    }
    case 'shop-details': {
      const form = values as AdminSellerShopDetailsFormValues;
      return {
        storeTitle: form.storeTitle.trim() || undefined,
        storeDesc: form.storeDesc.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        taxVatNumber: form.taxVatNumber.trim() || undefined,
        productGallery: form.productGallery.trim() || undefined,
        storeBanner: form.storeBanner.trim() || seller?.storeBanner,
        storeLogo: form.storeLogo.trim() || seller?.storeLogo,
        userProfile: form.userProfile.trim() || seller?.userProfile,
        slug: seller?.slug,
      };
    }
    case 'payment-information': {
      const form = values as AdminSellerPaymentFormValues;
      return {
        paymentInfo: [
          {
            accountHolderName: form.accountHolderName.trim(),
            accountNumber: form.accountNumber.trim(),
            swiftCode: form.swiftCode.trim() || undefined,
            bankName: form.bankName.trim() || undefined,
            ibanNumber: form.ibanNumber.trim() || undefined,
          },
        ],
      };
    }
    case 'shop-policies': {
      const form = values as AdminSellerPoliciesFormValues;
      const faqList = form.faqList
        .map((entry) => ({
          question: entry.question.trim(),
          answer: entry.answer.trim(),
        }))
        .filter((entry) => entry.question && entry.answer);

      return {
        storePolicy: {
          cancellationPolicy: form.cancellationPolicy,
          cancellationPolicyTime: form.cancellationPolicyTime.trim() || undefined,
          returnPolicy: form.returnPolicy,
          returnPolicyDetails: form.returnPolicyDetails.trim() || undefined,
          faqList,
        },
      };
    }
    default:
      return {};
  }
}

export function formatAdminField(value?: string | null): string {
  if (!value?.trim()) return '—';
  return value.trim();
}

export function formatAdminBoolean(value?: boolean): string {
  return value ? 'Enabled' : 'Disabled';
}
