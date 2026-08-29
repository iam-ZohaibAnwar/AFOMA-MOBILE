import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminSectionTitle } from '../../../admin/dashboard/components/AdminSectionTitle';
import type { SellerDashboardOrderCounts, SellerDashboardPayoutSummary } from '../types';
import {
  formatDashboardCount,
  formatDashboardPayoutAmount,
  hasPendingPayoutAmount,
} from '../../utils/sellerDashboardDisplay';
import { sellerDashboardTheme } from '../utils/sellerDashboardTheme';

export interface SellerOperationalAlertsSectionProps {
  orderCounts: SellerDashboardOrderCounts | null;
  payoutSummary: SellerDashboardPayoutSummary | null;
  onPendingOrdersPress?: () => void;
  onDispatchedOrdersPress?: () => void;
  onPendingPayoutsPress?: () => void;
}

function AlertCard({
  tone,
  title,
  message,
  icon,
  action,
}: {
  tone: 'critical' | 'warning';
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  action?: { label: string; onPress: () => void };
}) {
  const toneStyles = tone === 'critical' ? styles.criticalCard : styles.warningCard;
  const titleColor = tone === 'critical' ? colors.error : colors.warningText;

  return (
    <View style={[styles.alertCard, toneStyles]}>
      <View style={styles.alertTop}>
        <View style={styles.alertCopy}>
          <AppText variant="bodyMedium" style={[styles.alertTitle, { color: titleColor }]}>
            {title}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {message}
          </AppText>
        </View>
        <View
          style={[
            styles.alertIconWrap,
            {
              backgroundColor:
                tone === 'critical'
                  ? sellerDashboardTheme.alertCriticalIconBackground
                  : sellerDashboardTheme.alertWarningIconBackground,
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={sellerDashboardTheme.alertIconColor} />
        </View>
      </View>

      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={action.onPress}
          style={({ pressed }) => [styles.actionButton, styles.actionReview, pressed && styles.pressed]}
        >
          <AppText variant="bodyMedium" style={styles.actionReviewLabel}>
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SellerOperationalAlertsSection({
  orderCounts,
  payoutSummary,
  onPendingOrdersPress,
  onDispatchedOrdersPress,
  onPendingPayoutsPress,
}: SellerOperationalAlertsSectionProps) {
  const pendingOrders = Number(orderCounts?.pendingOrdersCount ?? 0);
  const dispatchedOrders = Number(orderCounts?.dispatchedOrdersCount ?? 0);
  const hasPendingPayout = hasPendingPayoutAmount(payoutSummary?.totalPendingPayoutAmount);

  const hasAlerts = pendingOrders > 0 || dispatchedOrders > 0 || hasPendingPayout;

  if (!hasAlerts) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Shop alerts" icon="warning-outline" />

      <View style={styles.stack}>
        {pendingOrders > 0 ? (
          <AlertCard
            tone="critical"
            title="Orders awaiting fulfillment"
            message={`${formatDashboardCount(pendingOrders)} order${pendingOrders === 1 ? '' : 's'} need your attention.`}
            icon="cube-outline"
            action={
              onPendingOrdersPress
                ? { label: 'Manage orders', onPress: onPendingOrdersPress }
                : undefined
            }
          />
        ) : null}

        {dispatchedOrders > 0 ? (
          <AlertCard
            tone="warning"
            title="Orders in transit"
            message={`${formatDashboardCount(dispatchedOrders)} order${dispatchedOrders === 1 ? ' is' : 's are'} currently dispatched.`}
            icon="airplane-outline"
            action={
              onDispatchedOrdersPress
                ? { label: 'View orders', onPress: onDispatchedOrdersPress }
                : undefined
            }
          />
        ) : null}

        {hasPendingPayout ? (
          <View style={styles.pendingCard}>
            <AppText variant="bodyMedium" style={styles.pendingTitle}>
              Pending payouts
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={onPendingPayoutsPress}
              style={styles.pendingRow}
            >
              <AppText variant="bodySmall" color="textSecondary">
                Awaiting platform payout
              </AppText>
              <AppText variant="bodyMedium" style={styles.pendingValue}>
                CA${formatDashboardPayoutAmount(payoutSummary?.totalPendingPayoutAmount)}
              </AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  alertCard: {
    borderRadius: sellerDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: sellerDashboardTheme.cardBackground,
    ...shadows.card,
  },
  criticalCard: {
    backgroundColor: sellerDashboardTheme.alertCriticalCardBackground,
    borderColor: colors.errorBorder,
  },
  warningCard: {
    backgroundColor: sellerDashboardTheme.alertWarningCardBackground,
    borderColor: colors.border,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  alertCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 17,
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionReview: {
    backgroundColor: sellerDashboardTheme.alertReviewButton,
  },
  actionReviewLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  pendingCard: {
    borderRadius: sellerDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: sellerDashboardTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  pendingTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pendingValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
