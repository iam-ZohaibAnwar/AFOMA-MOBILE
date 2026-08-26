import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ReviewStarBreakdownRow } from '../utils/shopReviewsDisplay';

export interface ShopReviewsBreakdownProps {
  rows: ReviewStarBreakdownRow[];
}

export function ShopReviewsBreakdown({ rows }: ShopReviewsBreakdownProps) {
  return (
    <View style={styles.card}>
      {rows.map((row) => (
        <View key={row.star} style={styles.row}>
          <AppText variant="bodySmall" style={styles.starLabel}>
            {row.star} star
          </AppText>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${row.percentage}%` }]} />
          </View>

          <AppText
            variant="bodySmall"
            color="textMuted"
            style={styles.percentLabel}
            numberOfLines={1}
          >
            {`${row.percentage}%`}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  starLabel: {
    width: 44,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWhite,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    minWidth: 0,
  },
  percentLabel: {
    minWidth: 44,
    flexShrink: 0,
    textAlign: 'right',
    fontWeight: '600',
  },
});
