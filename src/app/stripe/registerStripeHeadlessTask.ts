import { AppRegistry, Platform } from 'react-native';

/**
 * Stripe Payment Sheet on Android starts a headless JS task while the native
 * UI is open so timers/network keep running (new architecture workaround).
 * Register it before StripeProvider mounts to avoid:
 * "No task registered for key StripeKeepJsAwakeTask"
 */
export function registerStripeHeadlessTask(): void {
  if (Platform.OS !== 'android') {
    return;
  }

  AppRegistry.registerHeadlessTask('StripeKeepJsAwakeTask', () => () =>
    new Promise<void>(() => {}),
  );
}
