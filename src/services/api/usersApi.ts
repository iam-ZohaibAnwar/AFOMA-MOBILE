import type { UserRole } from '../../features/auth/types';
import { apiGet, apiPut } from './request';

export interface SavedUserAddress {
  _id?: string;
  firstName?: string;
  lastName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  countryCode?: string;
  ZipCode?: string;
  zipcode?: string;
  phone?: string;
  moNumber?: string;
  isDefault?: boolean;
}

export interface UserProfileResponse {
  userId?: string;
  _id?: string;
  userRole?: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  moNumber?: string;
  gender?: string;
  DOB?: string;
  web3address?: string;
  networkType?: string;
  userProfile?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  countryName?: string;
  Country?: string;
  countryCode?: string;
  ZipCode?: string;
  zipcode?: string;
  company?: string;
  address?: SavedUserAddress[];
}

/** PUT /users/{userId} — customer account details (web parity). */
export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  DOB?: string | null;
  gender?: string;
  email: string;
  phone: string;
  web3address?: string;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  ZipCode: string;
  countryCode: string;
  stateCode: string;
}

export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  return apiGet<UserProfileResponse>(`/users/${userId}`, undefined, 'Failed to load user profile');
}

export async function updateUserAddresses(
  userId: string,
  address: SavedUserAddress[],
): Promise<UserProfileResponse> {
  return apiPut<UserProfileResponse>(
    `/users/${userId}`,
    { address },
    undefined,
    'Failed to update saved addresses',
  );
}

export async function updateUserProfile(
  userId: string,
  body: UpdateUserProfileRequest,
): Promise<UserProfileResponse> {
  return apiPut<UserProfileResponse>(
    `/users/${userId}`,
    body,
    undefined,
    'Failed to update account details',
  );
}
