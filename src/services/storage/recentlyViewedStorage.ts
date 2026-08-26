import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';

const MAX_RECENTLY_VIEWED = 5;

export async function getRecentlyViewedProductIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.recentlyViewed);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

/** Persists the product id and returns the updated id list (newest first, max 5). */
export async function addRecentlyViewedProductId(productId: string): Promise<string[]> {
  const normalized = productId.trim();
  if (!normalized) {
    return getRecentlyViewedProductIds();
  }

  const existing = await getRecentlyViewedProductIds();
  const next = [normalized, ...existing.filter((id) => id !== normalized)].slice(0, MAX_RECENTLY_VIEWED);

  await AsyncStorage.setItem(STORAGE_KEYS.recentlyViewed, JSON.stringify(next));
  return next;
}
