import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

type ExpoDeviceModule = {
  isDevice?: boolean;
};

const expoDeviceNative = requireOptionalNativeModule<ExpoDeviceModule>('ExpoDevice');

/** SDK 54 splits expo-notifications into multiple native modules (no single ExpoNotifications). */
function resolveExpoNotificationsNativeModule(): unknown {
  return (
    requireOptionalNativeModule('ExpoNotificationPermissionsModule') ??
    requireOptionalNativeModule('ExpoPushTokenManager') ??
    requireOptionalNativeModule('ExpoNotificationsEmitter') ??
    requireOptionalNativeModule('ExpoNotificationsHandlerModule') ??
    requireOptionalNativeModule('ExpoNotifications')
  );
}

export type PushUnsupportedReason = 'simulator' | 'web' | 'native_module';

export function isExpoDeviceNativeAvailable(): boolean {
  return expoDeviceNative != null;
}

/** Push permission APIs require the expo-notifications native module. */
export function isPushNativeAvailable(): boolean {
  return resolveExpoNotificationsNativeModule() != null;
}

export function getPushUnsupportedReason(): PushUnsupportedReason | null {
  if (Platform.OS === 'web') {
    return 'web';
  }

  if (!isPushNativeAvailable()) {
    return 'native_module';
  }

  if (expoDeviceNative && expoDeviceNative.isDevice === false) {
    return 'simulator';
  }

  return null;
}

export function isPhysicalDevice(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  if (expoDeviceNative && typeof expoDeviceNative.isDevice === 'boolean') {
    return expoDeviceNative.isDevice;
  }

  // Dev client built before expo-device was linked — don't crash; assume a real device.
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export function getPushUnsupportedMessage(reason: PushUnsupportedReason): string {
  switch (reason) {
    case 'simulator':
      return 'Push notifications require a physical iPhone or Android device. They are not available in simulators or emulators.';
    case 'web':
      return 'Push notifications are not available in the web browser. Use the iOS or Android app on a phone.';
    case 'native_module':
      return 'This build is missing expo-notifications. Reload the app from Metro, or reinstall the latest development build if the message persists.';
    default:
      return 'Push notifications are unavailable on this device.';
  }
}
