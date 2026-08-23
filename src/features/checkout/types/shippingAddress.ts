export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  countryCode?: string;
  stateCode?: string;
}

export type ShippingAddressField = keyof ShippingAddress;

export type ShippingAddressErrors = Partial<Record<ShippingAddressField, string>>;

export const emptyShippingAddress = (): ShippingAddress => ({
  name: '',
  email: '',
  phone: '',
  streetAddress: '',
  city: '',
  state: '',
  zip: '',
  country: '',
});
