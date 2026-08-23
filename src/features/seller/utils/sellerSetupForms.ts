import type { SellerProfile, SellerSetupSectionId } from '../types/sellerProfile';
import type { CountryStateSelection } from '../../../utils/regionOptions';
import { createCountryStateSelection } from '../../../utils/regionOptions';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALPHABETS_PATTERN = /^[A-Za-z\s]+$/;
const NUMBERS_PATTERN = /^[0-9]+$/;
const ALPHANUMERIC_PATTERN = /^[0-9a-zA-Z]+$/;

/** API may return numeric fields (e.g. accountNumber) — normalize for form state. */
function toTrimmedString(value: unknown): string {
  if (value == null || value === '') return '';
  return String(value).trim();
}

export interface SellerPolicyFaqEntry {
  question: string;
  answer: string;
}

export interface BasicInfoFormValues {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  phone: string;
  web3address: string;
}

export interface SellerDetailsFormValues {
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

export interface SellerAddressFormValues {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  streetAddress: string;
  city: string;
  ZipCode: string;
}

export interface PaymentInfoFormValues {
  accountHolderName: string;
  accountNumber: string;
  swiftCode: string;
  bankName: string;
  ibanNumber: string;
  web3address: string;
}

export interface SellerPoliciesFormValues {
  cancellationPolicy: boolean;
  cancellationPolicyTime: string;
  returnPolicy: boolean;
  returnPolicyDetails: string;
  faqList: SellerPolicyFaqEntry[];
}

export interface CurrencyFormValues {
  currency: string;
}

export type SellerSectionFormValues =
  | BasicInfoFormValues
  | SellerAddressFormValues
  | SellerDetailsFormValues
  | PaymentInfoFormValues
  | SellerPoliciesFormValues
  | CurrencyFormValues;

export function basicInfoFormFromProfile(profile?: SellerProfile | null): BasicInfoFormValues {
  return {
    firstName: profile?.firstName?.trim() ?? '',
    lastName: profile?.lastName?.trim() ?? '',
    email: profile?.email?.trim() ?? '',
    gender: profile?.gender?.trim() ?? '',
    dob: profile?.DOB ? profile.DOB.slice(0, 10) : '',
    phone: profile?.phone?.trim() ?? '',
    web3address: profile?.web3address?.trim() ?? '',
  };
}

export function sellerDetailsFormFromProfile(profile?: SellerProfile | null): SellerDetailsFormValues {
  return {
    storeTitle: profile?.storeTitle?.trim() ?? '',
    storeDesc: profile?.storeDesc?.trim() ?? '',
    twitter: profile?.twitter?.trim() ?? '',
    facebook: profile?.facebook?.trim() ?? '',
    instagram: profile?.instagram?.trim() ?? '',
    taxVatNumber: profile?.taxVatNumber?.trim() ?? '',
    productGallery: profile?.productGallery?.trim() ?? '',
    storeBanner: profile?.storeBanner?.trim() ?? '',
    storeLogo: profile?.storeLogo?.trim() ?? '',
    userProfile: profile?.userProfile?.trim() ?? '',
  };
}

export function sellerAddressFormFromProfile(profile?: SellerProfile | null): SellerAddressFormValues {
  const selection = createCountryStateSelection(profile?.country ?? '', profile?.state ?? '', {
    countryCode: profile?.countryCode,
    stateCode: profile?.stateCode,
  });

  return {
    country: selection.country,
    countryCode: selection.countryCode,
    state: selection.state,
    stateCode: selection.stateCode,
    streetAddress: profile?.streetAddress?.trim() ?? '',
    city: profile?.city?.trim() ?? '',
    ZipCode: profile?.ZipCode?.trim() ?? '',
  };
}

export function sellerAddressSelectionFromForm(values: SellerAddressFormValues): CountryStateSelection {
  return createCountryStateSelection(values.country, values.state, {
    countryCode: values.countryCode,
    stateCode: values.stateCode,
  });
}

export function paymentInfoFormFromProfile(profile?: SellerProfile | null): PaymentInfoFormValues {
  const payment = profile?.paymentInfo?.[0];
  return {
    accountHolderName: toTrimmedString(payment?.accountHolderName),
    accountNumber: toTrimmedString(payment?.accountNumber),
    swiftCode: toTrimmedString(payment?.swiftCode),
    bankName: toTrimmedString(payment?.bankName),
    ibanNumber: toTrimmedString(payment?.ibanNumber),
    web3address: toTrimmedString(profile?.web3address),
  };
}

export function sellerPoliciesFormFromProfile(profile?: SellerProfile | null): SellerPoliciesFormValues {
  const faqList = Array.isArray(profile?.storePolicy?.faqList)
    ? profile.storePolicy.faqList
        .map((entry) => ({
          question: entry.question?.trim() ?? '',
          answer: entry.answer?.trim() ?? '',
        }))
        .filter((entry) => entry.question || entry.answer)
    : [];

  return {
    cancellationPolicy: profile?.storePolicy?.cancellationPolicy === true,
    cancellationPolicyTime: String(profile?.storePolicy?.cancellationPolicyTime ?? ''),
    returnPolicy: profile?.storePolicy?.returnPolicy === true,
    returnPolicyDetails: profile?.storePolicy?.returnPolicyDetails?.trim() ?? '',
    faqList,
  };
}

export function currencyFormFromProfile(profile?: SellerProfile | null): CurrencyFormValues {
  return {
    currency: profile?.shippingConfigId?.currency?.trim().toLowerCase() ?? 'cad',
  };
}

export function validateBasicInfoForm(values: BasicInfoFormValues): Partial<Record<keyof BasicInfoFormValues, string>> {
  const errors: Partial<Record<keyof BasicInfoFormValues, string>> = {};
  if (!values.firstName.trim()) errors.firstName = 'Required';
  else if (!ALPHABETS_PATTERN.test(values.firstName.trim())) errors.firstName = 'Only alphabets allowed';
  if (!values.lastName.trim()) errors.lastName = 'Required';
  if (!values.email.trim()) errors.email = 'Required';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Invalid email';
  if (!values.gender.trim()) errors.gender = 'Required';
  if (!values.dob.trim()) errors.dob = 'Required';
  return errors;
}

export function validateSellerAddressForm(
  values: SellerAddressFormValues,
): Partial<Record<keyof SellerAddressFormValues, string>> {
  const errors: Partial<Record<keyof SellerAddressFormValues, string>> = {};
  if (!values.country.trim()) errors.country = 'Required';
  if (!values.state.trim()) errors.state = 'Required';
  if (!values.streetAddress.trim()) errors.streetAddress = 'Required';
  if (!values.city.trim()) errors.city = 'Required';
  if (!values.ZipCode.trim()) errors.ZipCode = 'Required';
  return errors;
}

export function validateSellerDetailsForm(
  values: SellerDetailsFormValues,
): Partial<Record<keyof SellerDetailsFormValues, string>> {
  const errors: Partial<Record<keyof SellerDetailsFormValues, string>> = {};
  if (!values.storeDesc.trim()) errors.storeDesc = 'Required';
  if (values.storeDesc.length > 1000) errors.storeDesc = 'Max 1000 characters';
  if (values.taxVatNumber && !NUMBERS_PATTERN.test(values.taxVatNumber)) {
    errors.taxVatNumber = 'Numbers only';
  }
  return errors;
}

export function validatePaymentInfoForm(
  values: PaymentInfoFormValues,
): Partial<Record<keyof PaymentInfoFormValues, string>> {
  const errors: Partial<Record<keyof PaymentInfoFormValues, string>> = {};
  if (!values.accountHolderName.trim()) errors.accountHolderName = 'Required';
  if (!values.accountNumber.trim()) errors.accountNumber = 'Required';
  else if (!NUMBERS_PATTERN.test(values.accountNumber.trim())) errors.accountNumber = 'Numbers only';
  if (values.swiftCode && !ALPHANUMERIC_PATTERN.test(values.swiftCode.trim())) {
    errors.swiftCode = 'Alphanumeric only';
  }
  if (values.ibanNumber && !ALPHANUMERIC_PATTERN.test(values.ibanNumber.trim())) {
    errors.ibanNumber = 'Alphanumeric only';
  }
  return errors;
}

export function validateSellerPoliciesForm(
  values: SellerPoliciesFormValues,
): Partial<Record<keyof SellerPoliciesFormValues, string>> {
  const errors: Partial<Record<keyof SellerPoliciesFormValues, string>> = {};
  if (!values.cancellationPolicy) errors.cancellationPolicy = 'Required';
  if (!values.returnPolicy) errors.returnPolicy = 'Required';
  return errors;
}

export function validateCurrencyForm(values: CurrencyFormValues): Partial<Record<keyof CurrencyFormValues, string>> {
  const errors: Partial<Record<keyof CurrencyFormValues, string>> = {};
  if (!values.currency.trim()) errors.currency = 'Required';
  return errors;
}

export function buildBasicInfoPayload(values: BasicInfoFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    DOB: values.dob.trim(),
    gender: values.gender.trim(),
    phone: values.phone.trim(),
    web3address: values.web3address.trim() || undefined,
    data: 'basicInfo',
    profileSetup: { basicInfo: true },
  };
}

export function buildSellerDetailsPayload(values: SellerDetailsFormValues, profile?: SellerProfile | null) {
  return {
    storeTitle: values.storeTitle.trim() || undefined,
    storeDesc: values.storeDesc.trim(),
    twitter: values.twitter.trim() || undefined,
    facebook: values.facebook.trim() || undefined,
    instagram: values.instagram.trim() || undefined,
    taxVatNumber: values.taxVatNumber.trim() || undefined,
    productGallery: values.productGallery.trim() || undefined,
    storeBanner: values.storeBanner.trim() || profile?.storeBanner,
    storeLogo: values.storeLogo.trim() || profile?.storeLogo,
    userProfile: values.userProfile.trim() || profile?.userProfile,
    slug: profile?.slug,
    data: 'sellerDetails',
    profileSetup: { sellerDetails: true },
  };
}

export function buildSellerAddressPayload(values: SellerAddressFormValues) {
  const selection = sellerAddressSelectionFromForm(values);

  return {
    country: selection.country.trim(),
    countryCode: selection.countryCode.trim() || undefined,
    state: selection.state.trim(),
    stateCode: selection.stateCode.trim() || undefined,
    streetAddress: values.streetAddress.trim(),
    city: values.city.trim(),
    ZipCode: values.ZipCode.trim(),
  };
}

export function buildPaymentInfoPayload(values: PaymentInfoFormValues, profile?: SellerProfile | null) {
  return {
    paymentInfo: [
      {
        accountHolderName: values.accountHolderName.trim(),
        accountNumber: values.accountNumber.trim(),
        swiftCode: values.swiftCode.trim() || undefined,
        bankName: values.bankName.trim() || undefined,
        ibanNumber: values.ibanNumber.trim() || undefined,
        productStatus: profile?.status,
      },
    ],
    web3address: values.web3address.trim() || undefined,
    data: 'paymentInfo',
    profileSetup: { paymentInfo: true },
  };
}

export function buildSellerPoliciesPayload(values: SellerPoliciesFormValues) {
  const faqList = values.faqList
    .map((entry) => ({
      question: entry.question.trim(),
      answer: entry.answer.trim(),
    }))
    .filter((entry) => entry.question && entry.answer);

  return {
    storePolicy: {
      cancellationPolicy: values.cancellationPolicy,
      cancellationPolicyTime: values.cancellationPolicyTime.trim() || undefined,
      returnPolicy: values.returnPolicy,
      returnPolicyDetails: values.returnPolicyDetails.trim() || undefined,
      faqList,
    },
    data: 'sellerPolicies',
    profileSetup: { sellerPolicies: true },
  };
}

export const CURRENCY_OPTIONS = [
  { label: 'CAD — Canadian Dollar', value: 'cad' },
  { label: 'USD — US Dollar', value: 'usd' },
  { label: 'EUR — Euro', value: 'eur' },
  { label: 'GBP — British Pound', value: 'gbp' },
];

export function getSectionTitle(sectionId: SellerSetupSectionId): string {
  switch (sectionId) {
    case 'basicInfo':
      return 'Basic Information';
    case 'address':
      return 'Business Address';
    case 'sellerDetails':
      return 'Seller Details';
    case 'paymentInfo':
      return 'Payment Information';
    case 'sellerPolicies':
      return 'Seller Policies';
    case 'currency':
      return 'Currency';
    case 'domesticShipping':
      return 'Domestic Shipping';
    case 'internationalShipping':
      return 'International Shipping';
    default:
      return 'Setup';
  }
}
