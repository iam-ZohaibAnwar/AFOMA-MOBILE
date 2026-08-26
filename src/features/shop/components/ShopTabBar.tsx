import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShopTab } from '../hooks/useShopScreen';

const TABS: Array<{ id: ShopTab; label: string }> = [
  { id: 'products', label: 'Products' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

export interface ShopTabBarProps {
  activeTab: ShopTab;
  onTabChange: (tab: ShopTab) => void;
}

export function ShopTabBar({ activeTab, onTabChange }: ShopTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onTabChange(tab.id)}
            style={styles.tab}
          >
            <AppText
              variant="bodyMedium"
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
            >
              {tab.label}
            </AppText>
            {isActive ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.background,
    marginTop: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tabLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    paddingBottom: spacing.sm,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: colors.primary,
  },
  indicatorSpacer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
