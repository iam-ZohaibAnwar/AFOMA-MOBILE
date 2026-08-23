import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShopTab } from '../hooks/useShopScreen';

const TABS: Array<{ id: ShopTab; label: string }> = [
  { id: 'products', label: 'Products' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

export interface ShopTabBarProps {
  activeTab: ShopTab;
  onTabChange: (tab: ShopTab) => void;
  productCount?: number;
  reviewCount?: number;
}

export function ShopTabBar({
  activeTab,
  onTabChange,
  productCount,
  reviewCount,
}: ShopTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count =
          tab.id === 'products' ? productCount : tab.id === 'reviews' ? reviewCount : undefined;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(tab.id)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <AppText variant="label" style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
              {typeof count === 'number' ? ` (${count})` : ''}
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.surface,
  },
});
