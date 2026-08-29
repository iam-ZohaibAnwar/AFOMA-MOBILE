import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';

export type AdminBottomNavTab = 'dashboard' | 'orders' | 'products' | 'settings';

interface AdminBottomNavItem {
  key: AdminBottomNavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: AdminBottomNavItem[] = [
  { key: 'dashboard', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', iconActive: 'receipt' },
  { key: 'products', label: 'Products', icon: 'cube-outline', iconActive: 'cube' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export interface AdminBottomNavProps {
  activeTab: AdminBottomNavTab;
  onSelect: (tab: AdminBottomNavTab) => void;
}

export function AdminBottomNav({ activeTab, onSelect }: AdminBottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.pill}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
              onPress={() => onSelect(item.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Ionicons
                name={isActive ? item.iconActive : item.icon}
                size={20}
                color={isActive ? colors.textInverse : colors.textMuted}
              />
              <AppText
                variant="caption"
                style={[styles.tabLabel, { color: isActive ? colors.textInverse : colors.textMuted }]}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: adminDashboardTheme.screenBackground,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: adminDashboardTheme.bottomNavHeight,
    borderRadius: adminDashboardTheme.bottomNavHeight / 2,
    backgroundColor: adminDashboardTheme.navBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: adminDashboardTheme.navBorder,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    ...shadows.floating,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  tabActive: {
    backgroundColor: adminDashboardTheme.navActiveBackground,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
