import type {
  AdminCreateSellerFormValues,
  AdminCreateSellerPayload,
} from '../types/adminCreateSeller';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALPHABETS_PATTERN = /^[A-Za-z\s]+$/;
const MIN_PASSWORD_LENGTH = 5;

export function validateAdminCreateSellerForm(
  values: AdminCreateSellerFormValues,
): Partial<Record<keyof AdminCreateSellerFormValues, string>> {
  const errors: Partial<Record<keyof AdminCreateSellerFormValues, string>> = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Required';
  } else if (!ALPHABETS_PATTERN.test(values.firstName.trim())) {
    errors.firstName = 'Only alphabets allowed';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Required';
  }

  if (!values.email.trim()) {
    errors.email = 'Required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Invalid email';
  }

  if (!values.password.trim()) {
    errors.password = 'Required';
  } else if (values.password.trim().length < MIN_PASSWORD_LENGTH) {
    errors.password = `Minimum ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (!values.phone.trim()) {
    errors.phone = 'Required';
  }

  if (!values.storeTitle.trim()) {
    errors.storeTitle = 'Required';
  }

  if (!values.country.trim()) {
    errors.country = 'Required';
  }

  if (!values.state.trim()) {
    errors.state = 'Required';
  }

  if (!values.city.trim()) {
    errors.city = 'Required';
  }

  if (!values.zipCode.trim()) {
    errors.zipCode = 'Required';
  }

  if (!values.streetAddress.trim()) {
    errors.streetAddress = 'Required';
  }

  return errors;
}

/** Admin POST /sellers contract — distinct from seller self-service setup payloads. */
export function buildAdminCreateSellerPayload(
  values: AdminCreateSellerFormValues,
): AdminCreateSellerPayload {
  const payload: AdminCreateSellerPayload = {
    enableProduct: false,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    password: values.password,
    country: values.country.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    storeTitle: values.storeTitle.trim(),
    ZipCode: values.zipCode.trim(),
    streetAddress: values.streetAddress.trim(),
    userRole: 'customer',
    status: 'Pending',
    countryCode: values.countryCode.trim(),
    stateCode: values.stateCode.trim(),
  };

  return payload;
}

export function mapAdminCreateSellerDuplicateError(statusCode?: number, message?: string): string | null {
  if (statusCode === 403) {
    return 'User already exists.';
  }

  if (message?.toLowerCase().includes('already exist')) {
    return 'User already exists.';
  }

  return null;
}
