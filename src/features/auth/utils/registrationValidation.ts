import { requiresReferralMember } from '../constants/registrationOptions';
import type {
  RegistrationAccountType,
  RegistrationFormErrors,
  RegistrationFormValues,
} from '../types/registration';
import { isValidEmail } from './validation';

const NAME_PATTERN = /^[a-zA-Z\s]+$/;

function requireText(value: string, message = 'Required'): string | undefined {
  return value.trim() ? undefined : message;
}

export function validateRegistrationForm(
  values: RegistrationFormValues,
  accountType: RegistrationAccountType,
): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = 'Required';
  } else if (!NAME_PATTERN.test(firstName)) {
    errors.firstName = 'Only alphabets are allowed';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Required';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Required';
  }

  if (!values.streetAddress.trim()) {
    errors.streetAddress = 'Required';
  }

  if (!values.city.trim()) {
    errors.city = 'Required';
  }

  if (!values.country.trim()) {
    errors.country = 'Required';
  }

  if (!values.state.trim()) {
    errors.state = 'Required';
  }

  if (!values.zipCode.trim()) {
    errors.zipCode = 'Required';
  }

  if (!values.referralSource.trim()) {
    errors.referralSource = 'Required';
  }

  if (requiresReferralMember(values.referralSource) && !values.referralId.trim()) {
    errors.referralId =
      values.referralSource === 'referred_by_seller'
        ? 'Select the seller who referred you'
        : 'Select the buyer who referred you';
  }

  if (accountType === 'seller' && !values.storeTitle.trim()) {
    errors.storeTitle = 'Required';
  }

  if (!values.agree) {
    errors.agree = 'Required';
  }

  return errors;
}
