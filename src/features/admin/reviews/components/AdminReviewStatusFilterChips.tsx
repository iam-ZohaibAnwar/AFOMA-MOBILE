import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminReviewStatusFilter } from '../types/adminReviews';

const STATUS_FILTERS: Array<{ value: AdminReviewStatusFilter; label: string }> = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Disapproved', label: 'Disapproved' },
];

export interface AdminReviewStatusFilterChipsProps {
  value: AdminReviewStatusFilter;
  onChange: (nextValue: AdminReviewStatusFilter) => void;
}

export function AdminReviewStatusFilterChips({
  value,
  onChange,
}: AdminReviewStatusFilterChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = value === filter.value;

          return (
            <Pressable
              key={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(filter.value)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <AppText
                variant="bodySmall"
                color={isActive ? 'textInverse' : 'textSecondary'}
                style={styles.chipLabel}
              >
                {filter.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontWeight: '600',
  },
});
