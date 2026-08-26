import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { CartBadge } from '../../components/ecommerce';

export type TabIconName = 'home' | 'browse' | 'search' | 'cart' | 'account';

const TAB_ICON_NAMES: Record<
  TabIconName,
  { outline: ComponentProps<typeof Ionicons>['name']; filled: ComponentProps<typeof Ionicons>['name'] }
> = {
  home: { outline: 'home-outline', filled: 'home' },
  browse: { outline: 'grid-outline', filled: 'grid' },
  search: { outline: 'search-outline', filled: 'search' },
  cart: { outline: 'cart-outline', filled: 'cart' },
  account: { outline: 'person-outline', filled: 'person' },
};

const ICON_SIZE = 26;

interface TabBarIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  badgeCount?: number;
}

export function TabBarIcon({ name, color, focused, badgeCount = 0 }: TabBarIconProps) {
  const iconName = focused ? TAB_ICON_NAMES[name].filled : TAB_ICON_NAMES[name].outline;

  const icon = <Ionicons name={iconName} size={ICON_SIZE} color={color} />;

  if (name === 'cart') {
    return (
      <View style={styles.wrap}>
        <CartBadge count={badgeCount}>{icon}</CartBadge>
      </View>
    );
  }

  return <View style={styles.wrap}>{icon}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
