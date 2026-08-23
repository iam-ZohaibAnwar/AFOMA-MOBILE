import { apiClient } from '../../../services/api/client';
import { toApiError } from '../../../services/api/errors';
import type { SelectOption } from '../../../utils/regionOptions';
import { requiresReferralMember } from '../constants/registrationOptions';

export interface RegisterBuyerPayload {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  ZipCode: string;
  phone: string;
  streetAddress: string;
  userRole: 'customer';
  countryCode: string;
  stateCode: string;
  referral_source: string;
  social_media: string;
  web3address?: string;
}

export interface RegisterSellerPayload {
  enableProduct: false;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  storeTitle: string;
  ZipCode: string;
  streetAddress: string;
  userRole: 'seller';
  status: 'Approved';
  countryCode: string;
  stateCode: string;
  referral_source: string;
  referral_id: string | null;
  social_media: string;
  social_media_handle: string;
  web3address?: string;
}

interface SellerReferralRecord {
  userId?: string;
  firstName?: string;
  lastName?: string;
  storeTitle?: string;
}

interface BuyerReferralRecord {
  _id?: string;
  firstName?: string;
  lastName?: string;
  userRole?: string;
}

export async function registerBuyer(payload: RegisterBuyerPayload): Promise<unknown> {
  try {
    const response = await apiClient.post('/users', payload);
    return response.data;
  } catch (error) {
    throw toApiError(error, 'Registration failed');
  }
}

export async function registerSeller(payload: RegisterSellerPayload): Promise<unknown> {
  try {
    const response = await apiClient.post('/sellers', payload);
    return response.data;
  } catch (error) {
    throw toApiError(error, 'Seller registration failed');
  }
}

export async function fetchSellerReferralOptions(): Promise<SelectOption[]> {
  try {
    const response = await apiClient.get<SellerReferralRecord[]>('/sellers');
    return (response.data ?? [])
      .filter((seller) => seller.userId)
      .map((seller) => ({
        value: String(seller.userId),
        label: `${seller.firstName ?? ''} ${seller.lastName ?? ''} (${seller.storeTitle ?? 'Shop'})`.trim(),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  } catch {
    return [];
  }
}

export async function fetchBuyerReferralOptions(): Promise<SelectOption[]> {
  try {
    const response = await apiClient.get<BuyerReferralRecord[]>('/users');
    return (response.data ?? [])
      .filter((user) => user.userRole === 'customer' && user._id)
      .map((user) => ({
        value: String(user._id),
        label: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  } catch {
    return [];
  }
}

export function buildSellerReferralId(
  referralSource: string,
  referralId: string,
): string | null {
  if (!requiresReferralMember(referralSource)) {
    return null;
  }

  return referralId.trim() || null;
}
