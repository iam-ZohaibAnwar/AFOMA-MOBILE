import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';

export interface GuestCheckoutProfile {
  name: string;
  email: string;
  country: string;
  streetAddress: string;
  state: string;
  stateCode?: string;
  ZipCode: string;
  city: string;
  countryCode?: string;
  phone?: string;
  userId?: string;
  _id?: string;
  accessToken?: string;
}

function parseGuestProfile(raw: string | null): GuestCheckoutProfile | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const profile = parsed as GuestCheckoutProfile;
    return profile.email?.trim() ? profile : null;
  } catch {
    return null;
  }
}

export async function loadGuestCheckoutProfile(): Promise<GuestCheckoutProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.guestCheckoutProfile);
  return parseGuestProfile(raw);
}

export async function saveGuestCheckoutProfile(profile: GuestCheckoutProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.guestCheckoutProfile, JSON.stringify(profile));
}

export async function clearGuestCheckoutProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.guestCheckoutProfile);
}
