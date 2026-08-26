import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface CategoryTabOption {
  id: string;
  label: string;
}

export interface CategoryTabBarProps {
  tabs: CategoryTabOption[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function CategoryTabBar({ tabs, activeTabId, onTabChange }: CategoryTabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 88,
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
