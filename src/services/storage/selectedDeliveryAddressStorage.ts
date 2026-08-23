import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { SavedUserAddress } from '../api/usersApi';

export async function loadSelectedDeliveryAddress(): Promise<SavedUserAddress | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.selectedDeliveryAddress);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed as SavedUserAddress;
  } catch {
    return null;
  }
}

export async function saveSelectedDeliveryAddress(address: SavedUserAddress): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.selectedDeliveryAddress, JSON.stringify(address));
}

export async function clearSelectedDeliveryAddress(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.selectedDeliveryAddress);
}
