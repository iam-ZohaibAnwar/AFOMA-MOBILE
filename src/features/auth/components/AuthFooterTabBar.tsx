import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { TabBarIcon, type TabIconName } from '../../../app/navigation/TabBarIcon';
import { colors, typography } from '../../../design-system';
import { useCart } from '../../cart/hooks/useCart';
import { getCartItemCount } from '../../cart/utils/cartUtils';
import { authReturnTo, dismissAuthAndOpenTab, type NavLike } from '../utils/authNavigation';
import { AUTH_FOOTER_TAB_BAR_HEIGHT } from './authFooterTabBarLayout';

export type AuthFooterTabName = 'home' | 'cart' | 'account';

interface AuthFooterTabItem {
  key: AuthFooterTabName;
  label: string;
  icon: TabIconName;
}

const TAB_ITEMS: AuthFooterTabItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'cart', label: 'Cart', icon: 'cart' },
  { key: 'account', label: 'Account', icon: 'account' },
];

export interface AuthFooterTabBarProps {
  activeTab?: AuthFooterTabName;
}

export function AuthFooterTabBar({ activeTab = 'account' }: AuthFooterTabBarProps) {
  const navigation = useNavigation<NavLike>();
  const insets = useSafeAreaInsets();
  const { cart } = useCart();
  const cartCount = getCartItemCount(cart);
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <View
      style={[
        styles.container,
        {
          height: AUTH_FOOTER_TAB_BAR_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {TAB_ITEMS.map((item) => {
        const isFocused = activeTab === item.key;
        const color = isFocused ? colors.primary : colors.textMuted;

        const onPress = () => {
          if (isFocused) {
            return;
          }

          if (item.key === 'home') {
            dismissAuthAndOpenTab(navigation, authReturnTo.homeTab());
            return;
          }

          if (item.key === 'cart') {
            dismissAuthAndOpenTab(navigation, authReturnTo.cartTab());
          }
        };

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={item.label}
            onPress={onPress}
            style={({ pressed }) => [styles.tabItem, pressed && !isFocused && styles.pressed]}
          >
            <TabBarIcon
              name={item.icon}
              color={color}
              focused={isFocused}
              badgeCount={item.key === 'cart' ? cartCount : 0}
            />
            <AppText variant="caption" style={[styles.tabLabel, { color }]}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 6,
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    gap: 2,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
