import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { SellerDashboardPayoutSummary } from '../../dashboard/types';
import { formatSellerEarningSummaryAmount } from '../utils/sellerEarningsDisplay';

export interface SellerEarningsSummaryProps {
  payoutSummary: SellerDashboardPayoutSummary | null;
  summaryError: string | null;
  onRetrySummary?: () => void;
}

export function SellerEarningsSummary({
  payoutSummary,
  summaryError,
  onRetrySummary,
}: SellerEarningsSummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="wallet-outline" size={20} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <AppText variant="caption" color="textMuted" style={styles.label}>
              PENDING PAYOUTS
            </AppText>
            <AppText variant="h3" style={styles.metricValue}>
              {formatSellerEarningSummaryAmount(payoutSummary?.totalPendingPayoutAmount)}
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricBlock}>
            <AppText variant="caption" color="textMuted" style={styles.label}>
              COMPLETED
            </AppText>
            <AppText variant="h3" style={styles.metricValue}>
              {formatSellerEarningSummaryAmount(payoutSummary?.totalPaidPayoutAmount)}
            </AppText>
          </View>
        </View>

        {summaryError ? (
          <View style={styles.errorRow}>
            <AppText variant="caption" color="error" style={styles.errorText}>
              {summaryError}
            </AppText>
            {onRetrySummary ? (
              <Pressable accessibilityRole="button" onPress={onRetrySummary} hitSlop={8}>
                <AppText variant="caption" color="textLink">
                  Retry
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metricBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.md,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  errorText: {
    flexShrink: 1,
  },
});
