import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { StoredUserProfile } from '../../features/auth/types';

export async function getStoredUserProfile(): Promise<StoredUserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed as StoredUserProfile;
  } catch {
    return null;
  }
}

export async function setStoredUserProfile(profile: StoredUserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
}

export async function clearStoredUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.user);
}
