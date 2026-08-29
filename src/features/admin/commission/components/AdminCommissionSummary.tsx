import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { formatAdminCommissionSummaryAmount } from '../utils/adminCommissionFormatters';

export interface AdminCommissionSummaryProps {
  totalCommissionAmount: number | null;
  summaryError: string | null;
  onRetrySummary?: () => void;
}

export function AdminCommissionSummary({
  totalCommissionAmount,
  summaryError,
  onRetrySummary,
}: AdminCommissionSummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="wallet-outline" size={20} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="caption" color="textMuted" style={styles.label}>
          TOTAL PLATFORM COMMISSION
        </AppText>
        <AppText variant="h3" style={styles.metricValue}>
          {formatAdminCommissionSummaryAmount(totalCommissionAmount)}
        </AppText>
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
    alignItems: 'center',
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
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
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
