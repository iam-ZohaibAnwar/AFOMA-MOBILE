import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface ScrollableStatusTabOption<T extends string> {
  label: string;
  value: T;
}

interface ScrollableOrderStatusTabsProps<T extends string> {
  tabs: Array<ScrollableStatusTabOption<T>>;
  activeValue: T;
  onChange: (value: T) => void;
}

export function ScrollableOrderStatusTabs<T extends string>({
  tabs,
  activeValue,
  onChange,
}: ScrollableOrderStatusTabsProps<T>) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeValue === tab.value;

          return (
            <Pressable
              key={tab.value || 'all'}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              onPress={() => onChange(tab.value)}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.background,
    marginHorizontal: -spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
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
