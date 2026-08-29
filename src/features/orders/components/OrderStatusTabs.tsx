import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { OrderStatusTabId } from '../utils/orderListFilters';
import { ORDER_STATUS_TABS } from '../utils/orderListFilters';

interface OrderStatusTabsProps {
  activeTabId: OrderStatusTabId;
  onTabChange: (tabId: OrderStatusTabId) => void;
}

export function OrderStatusTabs({ activeTabId, onTabChange }: OrderStatusTabsProps) {
  return (
    <View style={styles.container}>
      {ORDER_STATUS_TABS.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onTabChange(tab.id)}
            style={styles.tab}
          >
            <AppText
              variant="bodyMedium"
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              numberOfLines={1}
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
    marginHorizontal: -spacing.lg,
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
