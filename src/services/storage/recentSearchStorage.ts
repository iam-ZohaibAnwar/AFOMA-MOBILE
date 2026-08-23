import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_RECENT_SEARCHES } from '../../constants/searchDefaults';
import { STORAGE_KEYS } from '../../constants/storageKeys';

function normalizeSearchTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ');
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.recentSearches);
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

export async function addRecentSearch(term: string): Promise<string[]> {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) {
    return getRecentSearches();
  }

  const existing = await getRecentSearches();
  const next = [normalized, ...existing.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  await AsyncStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(next));
  return next;
}

export async function removeRecentSearch(term: string): Promise<string[]> {
  const normalized = normalizeSearchTerm(term);
  const existing = await getRecentSearches();
  const next = existing.filter((item) => item.toLowerCase() !== normalized.toLowerCase());

  await AsyncStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(next));
  return next;
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.recentSearches);
}
