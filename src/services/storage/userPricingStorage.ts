import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserPricingInfo } from '../pricing/types';

const USER_PRICING_KEY = 'afoma.userInfo';

export async function getStoredUserPricingInfo(): Promise<UserPricingInfo> {
  try {
    const raw = await AsyncStorage.getItem(USER_PRICING_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as UserPricingInfo;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function setStoredUserPricingInfo(info: UserPricingInfo): Promise<void> {
  await AsyncStorage.setItem(USER_PRICING_KEY, JSON.stringify(info));
}

export async function clearStoredUserPricingInfo(): Promise<void> {
  await AsyncStorage.removeItem(USER_PRICING_KEY);
}
