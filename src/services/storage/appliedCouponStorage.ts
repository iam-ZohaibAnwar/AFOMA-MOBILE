import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { AppliedCoupon } from '../types/coupon';

function storageKeyForUser(userId: string): string {
  return `${STORAGE_KEYS.appliedCoupon}.${userId}`;
}

export async function loadAppliedCoupon(userId: string): Promise<AppliedCoupon | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKeyForUser(userId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AppliedCoupon;
    if (!parsed?.couponCode?.trim()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveAppliedCoupon(
  userId: string,
  coupon: AppliedCoupon,
): Promise<void> {
  await AsyncStorage.setItem(storageKeyForUser(userId), JSON.stringify(coupon));
}

export async function clearAppliedCoupon(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKeyForUser(userId));
}
