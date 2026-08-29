import { apiPost } from '../api/request';

import type { NotificationPreferences } from './notificationPreferencesStorage';



export interface RegisterExpoPushTokenBody {

  userId: string;

  deviceId: string;

  expoPushToken: string;

  platform: 'expo';

  pushPreferences?: NotificationPreferences;

}



/** POST /api/push/subscribe — register Expo push token for mobile alerts. */

export async function registerExpoPushToken(body: RegisterExpoPushTokenBody): Promise<void> {

  await apiPost<void>('/api/push/subscribe', body, undefined, 'Failed to register push notifications');

}



export interface UnregisterExpoPushTokenBody {

  userId: string;

  deviceId: string;

}



/** POST /api/push/unsubscribe — remove this device's push token. */

export async function unregisterExpoPushToken(body: UnregisterExpoPushTokenBody): Promise<void> {

  await apiPost<void>('/api/push/unsubscribe', body, undefined, 'Failed to update push notifications');

}

