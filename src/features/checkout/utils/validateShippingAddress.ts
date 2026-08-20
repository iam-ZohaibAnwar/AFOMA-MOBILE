import type {
  ShippingAddress,
  ShippingAddressErrors,
  ShippingAddressField,
} from '../types/shippingAddress';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRequired(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return undefined;
}

export function validateShippingAddress(address: ShippingAddress): {
  isValid: boolean;
  errors: ShippingAddressErrors;
} {
  const errors: ShippingAddressErrors = {};

  const nameError = isRequired(address.name, 'Name');
  if (nameError) {
    errors.name = nameError;
  } else if (address.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const emailError = isRequired(address.email, 'Email');
  if (emailError) {
    errors.email = emailError;
  } else if (!EMAIL_PATTERN.test(address.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  const phoneError = isRequired(address.phone, 'Phone');
  if (phoneError) {
    errors.phone = phoneError;
  } else if (address.phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone number.';
  }

  errors.streetAddress = isRequired(address.streetAddress, 'Street address');
  errors.city = isRequired(address.city, 'City');
  errors.state = isRequired(address.state, 'State');
  errors.zip = isRequired(address.zip, 'ZIP');
  errors.country = isRequired(address.country, 'Country');

  const filteredErrors = Object.fromEntries(
    Object.entries(errors).filter(([, value]) => Boolean(value)),
  ) as ShippingAddressErrors;

  return {
    isValid: Object.keys(filteredErrors).length === 0,
    errors: filteredErrors,
  };
}

export function updateShippingAddressField(
  address: ShippingAddress,
  field: ShippingAddressField,
  value: string,
): ShippingAddress {
  return {
    ...address,
    [field]: value,
  };
}
