import { StyleSheet, View } from 'react-native';

import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { formatAdminCommissionSummaryAmount } from '../utils/adminCommissionFormatters';

export interface AdminCommissionSummaryProps {
  totalCommissionAmount: number | null;
  summaryError: string | null;
  onRetrySummary?: () => void;
}

export function AdminCommissionSummary({
  totalCommissionAmount,
  summaryError,
}: AdminCommissionSummaryProps) {
  return (
    <AppCard variant="muted">
      <AppText variant="label">Total Commission</AppText>
      <AppText variant="h3" style={styles.metricValue}>
        {formatAdminCommissionSummaryAmount(totalCommissionAmount)}
      </AppText>
      {summaryError ? (
        <AppText variant="caption" color="textSecondary">
          {summaryError}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  metricValue: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
