export type RegistrationAccountType = 'buyer' | 'seller';

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  country: string;
  state: string;
  countryCode: string;
  stateCode: string;
  zipCode: string;
  referralSource: string;
  referralId: string;
  socialMedia: string;
  socialMediaHandle: string;
  storeTitle: string;
  agree: boolean;
}

export type RegistrationFormField = keyof RegistrationFormValues;

export type RegistrationFormErrors = Partial<Record<RegistrationFormField, string>>;

export function createEmptyRegistrationFormValues(): RegistrationFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    country: '',
    state: '',
    countryCode: '',
    stateCode: '',
    zipCode: '',
    referralSource: '',
    referralId: '',
    socialMedia: '',
    socialMediaHandle: '',
    storeTitle: '',
    agree: false,
  };
}
