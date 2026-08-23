export interface AdminCreateSellerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  web3address: string;
  storeTitle: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  zipCode: string;
  streetAddress: string;
}

export interface AdminCreateSellerPayload {
  enableProduct: false;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  state: string;
  city: string;
  storeTitle: string;
  ZipCode: string;
  streetAddress: string;
  web3address?: string;
  userRole: 'customer';
  status: 'Pending';
  countryCode: string;
  stateCode: string;
}

export const ADMIN_CREATE_SELLER_INITIAL_VALUES: AdminCreateSellerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  web3address: '',
  storeTitle: '',
  country: '',
  countryCode: '',
  state: '',
  stateCode: '',
  city: '',
  zipCode: '',
  streetAddress: '',
};
