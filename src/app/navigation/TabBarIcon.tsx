import { useEffect, useRef } from 'react';
import type { ComponentProps } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CartBadge } from '../../components/ecommerce';
import { subscribeCartBadgeBump } from '../../features/cart/utils/cartFeedback';

export type TabIconName = 'home' | 'browse' | 'search' | 'cart' | 'account' | 'shop';

const TAB_ICON_NAMES: Record<
  TabIconName,
  { outline: ComponentProps<typeof Ionicons>['name']; filled: ComponentProps<typeof Ionicons>['name'] }
> = {
  home: { outline: 'home-outline', filled: 'home' },
  browse: { outline: 'grid-outline', filled: 'grid' },
  search: { outline: 'search-outline', filled: 'search' },
  cart: { outline: 'cart-outline', filled: 'cart' },
  account: { outline: 'person-outline', filled: 'person-outline' },
  shop: { outline: 'storefront-outline', filled: 'storefront' },
};

const ICON_SIZE = 26;

interface TabBarIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  badgeCount?: number;
}

export function TabBarIcon({ name, color, focused, badgeCount = 0 }: TabBarIconProps) {
  const bumpScale = useRef(new Animated.Value(1)).current;

  const runBump = () => {
    Animated.sequence([
      Animated.spring(bumpScale, {
        toValue: 1.28,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }),
      Animated.spring(bumpScale, {
        toValue: 1,
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    return subscribeCartBadgeBump(runBump);
  }, [bumpScale]);

  const iconName = focused ? TAB_ICON_NAMES[name].filled : TAB_ICON_NAMES[name].outline;

  const icon = <Ionicons name={iconName} size={ICON_SIZE} color={color} />;

  if (name === 'cart') {
    return (
      <Animated.View style={[styles.wrap, { transform: [{ scale: bumpScale }] }]}>
        <CartBadge count={badgeCount}>{icon}</CartBadge>
      </Animated.View>
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
