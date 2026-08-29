import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import {
  areAnyPushNotificationsEnabled,
  getNotificationPreferences,
} from './notificationPreferencesStorage';
import { registerExpoPushToken, unregisterExpoPushToken } from './pushApi';
import { isPhysicalDevice, isPushNativeAvailable, getPushUnsupportedReason } from './pushNativeSupport';

const PUSH_DEVICE_ID_KEY = 'afoma.push.deviceId';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

if (isPushNativeAvailable()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export { isPushNativeAvailable, getPushUnsupportedReason };
export type { PushUnsupportedReason } from './pushNativeSupport';
export { getPushUnsupportedMessage } from './pushNativeSupport';

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(PUSH_DEVICE_ID_KEY);
  if (existing?.trim()) {
    return existing.trim();
  }

  const generated = `mobile-${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(PUSH_DEVICE_ID_KEY, generated);
  return generated;
}

export async function getPushDeviceId(): Promise<string> {
  return getOrCreateDeviceId();
}

function resolvePermissionStatus(
  permissions: Notifications.NotificationPermissionsStatus,
): NotificationPermissionStatus {
  if (getPushUnsupportedReason() != null) {
    return 'unsupported';
  }

  if (!isPhysicalDevice()) {
    return 'unsupported';
  }

  if (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return 'granted';
  }

  if (
    permissions.ios?.status === Notifications.IosAuthorizationStatus.DENIED ||
    permissions.status === 'denied'
  ) {
    return 'denied';
  }

  return 'undetermined';
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!isPushNativeAvailable() || getPushUnsupportedReason() != null || !isPhysicalDevice()) {
    return 'unsupported';
  }

  const permissions = await Notifications.getPermissionsAsync();
  return resolvePermissionStatus(permissions);
}

export async function openNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

function resolveExpoProjectId(): string | undefined {
  const easProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof easProjectId === 'string' && easProjectId.trim()) {
    return easProjectId.trim();
  }

  const legacyProjectId = Constants.easConfig?.projectId;
  if (typeof legacyProjectId === 'string' && legacyProjectId.trim()) {
    return legacyProjectId.trim();
  }

  return undefined;
}

async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('chat-messages', {
    name: 'Chat messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#EA580C',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('marketplace-offers', {
    name: 'Offers & promotions',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#EA580C',
    sound: 'default',
  });
}

export async function requestExpoPushPermissions(): Promise<boolean> {
  if (!isPushNativeAvailable() || !isPhysicalDevice()) {
    return false;
  }

  await ensureAndroidNotificationChannels();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!isPushNativeAvailable() || !isPhysicalDevice()) {
    return null;
  }

  const hasPermission = await requestExpoPushPermissions();
  if (!hasPermission) {
    return null;
  }

  const projectId = resolveExpoProjectId();
  if (!projectId) {
    console.warn('Expo push token unavailable: missing EAS projectId in app config.');
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data?.trim() || null;
}

export async function registerDevicePushToken(userId: string): Promise<string | null> {
  if (!isPushNativeAvailable()) {
    return null;
  }

  const preferences = await getNotificationPreferences();
  const anyEnabled = preferences.chatMessages || preferences.marketplaceOffers;
  if (!anyEnabled) {
    await unregisterDevicePushToken(userId);
    return null;
  }

  const token = await getExpoPushToken();
  if (!token) {
    return null;
  }

  const deviceId = await getOrCreateDeviceId();

  await registerExpoPushToken({
    userId,
    deviceId,
    expoPushToken: token,
    platform: 'expo',
    pushPreferences: preferences,
  });

  return token;
}

export async function unregisterDevicePushToken(userId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  await unregisterExpoPushToken({ userId, deviceId });
}

export async function syncDevicePushRegistration(userId: string): Promise<string | null> {
  if (!isPushNativeAvailable()) {
    return null;
  }

  const anyEnabled = await areAnyPushNotificationsEnabled();
  if (!anyEnabled) {
    await unregisterDevicePushToken(userId);
    return null;
  }

  return registerDevicePushToken(userId);
}

export type PushNotificationPayload = {
  type?: string;
  chatId?: string;
  senderId?: string;
  notificationId?: string;
};

export function extractPushNotificationData(
  response: Notifications.NotificationResponse | Notifications.Notification,
): PushNotificationPayload {
  const content =
    'notification' in response ? response.notification.request.content : response.request.content;
  const data = content.data ?? {};

  return {
    type: typeof data.type === 'string' ? data.type : undefined,
    chatId: typeof data.chatId === 'string' ? data.chatId : undefined,
    senderId: typeof data.senderId === 'string' ? data.senderId : undefined,
    notificationId:
      typeof data.notificationId === 'string' ? data.notificationId : undefined,
  };
}

export function extractChatNotificationData(
  response: Notifications.NotificationResponse | Notifications.Notification,
): { chatId?: string; senderId?: string } {
  const data = extractPushNotificationData(response);
  return { chatId: data.chatId, senderId: data.senderId };
}

export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  if (!isPushNativeAvailable()) {
    return { remove: () => undefined };
  }

  return Notifications.addNotificationResponseReceivedListener(listener);
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  if (!isPushNativeAvailable()) {
    return { remove: () => undefined };
  }

  return Notifications.addNotificationReceivedListener(listener);
}

export async function getInitialNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  if (!isPushNativeAvailable()) {
    return null;
  }

  return Notifications.getLastNotificationResponseAsync();
}
