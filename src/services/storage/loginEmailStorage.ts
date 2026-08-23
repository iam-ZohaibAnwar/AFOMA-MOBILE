import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';

export async function getLastLoginEmail(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.lastLoginEmail);
    return value?.trim() ?? '';
  } catch {
    return '';
  }
}

export async function setLastLoginEmail(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.lastLoginEmail, trimmed);
}
