import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../../constants/storageKeys';

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.accessToken);
}

export async function setAccessToken(token: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.accessToken, token);
}

export async function clearAccessToken(): Promise<void> {
  await deleteSecureItem(STORAGE_KEYS.accessToken);
}
