import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/ui/AppText';
import { colors, typography } from '../../design-system';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { authReturnTo, openAuthLogin } from '../../features/auth/utils/authNavigation';
import type { MainTabParamList } from './types';
import { TabBarIcon, type TabIconName } from './TabBarIcon';

const TAB_BAR_HEIGHT = 56;

type MarketplaceSegment = 'home';

interface MarketplaceTabItem {
  key: string;
  label: string;
  icon: TabIconName;
  routeName: keyof MainTabParamList;
  segment?: MarketplaceSegment;
}

const TAB_ITEMS: MarketplaceTabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', routeName: 'MarketplaceTab', segment: 'home' },
  { key: 'cart', label: 'Cart', icon: 'cart', routeName: 'CartTab' },
  { key: 'account', label: 'Account', icon: 'account', routeName: 'AccountTab' },
];

export function MarketplaceTabBarWithCartBadge({
  state,
  navigation,
  cartCount,
}: BottomTabBarProps & { cartCount: number }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const activeRoute = state.routes[state.index];

  if (activeRoute.name === 'CartTab') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          height: TAB_BAR_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {TAB_ITEMS.map((item) => {
        const isMarketplaceItem = item.routeName === 'MarketplaceTab';
        const isFocused = isMarketplaceItem
          ? activeRoute.name === 'MarketplaceTab'
          : activeRoute.name === item.routeName;

        const color = isFocused ? colors.primary : colors.textMuted;

        const onPress = () => {
          if (item.routeName === 'AccountTab' && !isLoading && !isAuthenticated) {
            openAuthLogin(navigation, authReturnTo.accountTab());
            return;
          }

          if (isMarketplaceItem && item.segment) {
            navigation.navigate('MarketplaceTab', { segment: item.segment });
            return;
          }

          navigation.navigate(item.routeName);
        };

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={item.label}
            onPress={onPress}
            style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}
          >
            <TabBarIcon
              name={item.icon}
              color={color}
              focused={isFocused}
              badgeCount={item.routeName === 'CartTab' ? cartCount : 0}
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
