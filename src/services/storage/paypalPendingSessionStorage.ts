import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { CheckoutOrderParams } from '../../features/checkout/utils/buildCheckoutOrderPayload';
import type { CreateCheckoutOrderRequest } from '../types/order';

export interface PayPalPendingSession {
  orderId: string;
  approvalUrl: string;
  createPayload: CreateCheckoutOrderRequest;
  checkoutParams: CheckoutOrderParams;
  startedAt: number;
}

const MAX_AGE_MS = 30 * 60 * 1000;

export async function savePayPalPendingSession(session: PayPalPendingSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.paypalPendingCheckout, JSON.stringify(session));
}

export async function loadPayPalPendingSession(): Promise<PayPalPendingSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.paypalPendingCheckout);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PayPalPendingSession;
    if (!parsed?.orderId || !parsed.createPayload || !parsed.checkoutParams) {
      return null;
    }

    if (Date.now() - (parsed.startedAt ?? 0) > MAX_AGE_MS) {
      await clearPayPalPendingSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function clearPayPalPendingSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.paypalPendingCheckout);
}
