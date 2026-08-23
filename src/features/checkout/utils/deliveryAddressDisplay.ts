import type { DeliveryAddressListItem } from '../types/deliveryAddress';

export function formatDeliveryAddressLine(address: DeliveryAddressListItem): string {
  return [
    address.streetAddress,
    address.city,
    address.state,
    address.ZipCode ?? address.zipcode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function validateSavedAddressForm(values: {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}): Partial<Record<'firstName' | 'lastName' | 'streetAddress' | 'city' | 'state' | 'zip' | 'country', string>> {
  const errors: Partial<
    Record<'firstName' | 'lastName' | 'streetAddress' | 'city' | 'state' | 'zip' | 'country', string>
  > = {};

  if (!values.firstName.trim()) errors.firstName = 'Required';
  if (!values.lastName.trim()) errors.lastName = 'Required';
  if (!values.streetAddress.trim()) errors.streetAddress = 'Required';
  if (!values.city.trim()) errors.city = 'Required';
  if (!values.state.trim()) errors.state = 'Required';
  if (!values.zip.trim()) errors.zip = 'Required';
  if (!values.country.trim()) errors.country = 'Required';

  return errors;
}
