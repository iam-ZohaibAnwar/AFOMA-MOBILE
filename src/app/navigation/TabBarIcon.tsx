import { StyleSheet, Text, View } from 'react-native';

import { CartBadge } from '../../components/ecommerce';
import { colors, typography } from '../../design-system';

export type TabIconName = 'home' | 'browse' | 'search' | 'cart' | 'account';

const TAB_ICON_GLYPHS: Record<TabIconName, string> = {
  home: '⌂',
  browse: '▦',
  search: '⌕',
  cart: '🛒',
  account: '👤',
};

interface TabBarIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  badgeCount?: number;
}

export function TabBarIcon({ name, color, focused, badgeCount = 0 }: TabBarIconProps) {
  const icon = (
    <Text style={[styles.icon, focused && styles.iconFocused, { color }]}>
      {TAB_ICON_GLYPHS[name]}
    </Text>
  );

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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    ...typography.bodyMedium,
    fontSize: 18,
    lineHeight: 20,
    color: colors.textMuted,
  },
  iconFocused: {
    fontWeight: '700',
  },
});
