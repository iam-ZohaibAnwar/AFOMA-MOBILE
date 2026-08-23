import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { CartMap } from '../types/cart';

function parseCartMap(raw: string | null): CartMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as CartMap;
    }
  } catch {
    // Ignore corrupt local cart payloads.
  }

  return {};
}

export async function loadGuestCart(): Promise<CartMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.guestCart);
  return parseCartMap(raw);
}

export async function saveGuestCart(cart: CartMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.guestCart, JSON.stringify(cart));
}

export async function clearGuestCart(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.guestCart);
}
