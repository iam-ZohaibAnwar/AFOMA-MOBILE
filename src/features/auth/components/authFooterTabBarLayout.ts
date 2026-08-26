import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AUTH_FOOTER_TAB_BAR_HEIGHT = 56;

export function useAuthFooterTabBarInset(): number {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return AUTH_FOOTER_TAB_BAR_HEIGHT + bottomInset;
}
