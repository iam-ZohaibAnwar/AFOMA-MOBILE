import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type {
  AdminPendingOrdersCount,
  AdminPendingPayoutCount,
  AdminPendingProductCount,
  AdminProductStockStatus,
  AdminTotalOrdersCount,
} from '../types/adminDashboard';
import { formatAdminCount, formatAdminOptionalCount } from '../utils/adminDashboardDisplay';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';
import { AdminSectionTitle } from './AdminSectionTitle';

export interface AdminOperationalAlertsSectionProps {
  stockStatus: AdminProductStockStatus | null;
  pendingProducts: AdminPendingProductCount | null;
  pendingPayouts: AdminPendingPayoutCount | null;
  totalOrders: AdminTotalOrdersCount | null;
  pendingOrders: AdminPendingOrdersCount | null;
  errors: {
    stockStatus?: string;
    pendingProducts?: string;
    pendingPayouts?: string;
    totalOrders?: string;
    pendingOrders?: string;
  };
  onRetry?: () => void;
  onRestockPress?: () => void;
  onLowStockPress?: () => void;
  onPendingProductsPress?: () => void;
  onPendingPayoutsPress?: () => void;
  onPendingOrdersPress?: () => void;
}

function AlertActionButton({
  label,
  tone,
  onPress,
  fullWidth = false,
}: {
  label: string;
  tone: 'critical' | 'review' | 'neutral';
  onPress: () => void;
  fullWidth?: boolean;
}) {
  const toneStyle =
    tone === 'critical'
      ? styles.actionCritical
      : tone === 'review'
        ? styles.actionReview
        : styles.actionNeutral;
  const labelStyle =
    tone === 'critical'
      ? styles.actionCriticalLabel
      : tone === 'review'
        ? styles.actionReviewLabel
        : styles.actionNeutralLabel;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        toneStyle,
        fullWidth && styles.actionFullWidth,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="bodyMedium" style={labelStyle}>
        {label}
      </AppText>
    </Pressable>
  );
}

function AlertCard({
  tone,
  title,
  message,
  icon,
  primaryAction,
  secondaryAction,
}: {
  tone: 'critical' | 'warning';
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  primaryAction?: { label: string; onPress: () => void; fullWidth?: boolean };
  secondaryAction?: { label: string; onPress: () => void };
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
                  ? adminDashboardTheme.alertCriticalIconBackground
                  : adminDashboardTheme.alertWarningIconBackground,
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={adminDashboardTheme.alertIconColor} />
        </View>
      </View>

      {primaryAction && !secondaryAction ? (
        <AlertActionButton
          label={primaryAction.label}
          tone="critical"
          onPress={primaryAction.onPress}
          fullWidth={primaryAction.fullWidth}
        />
      ) : null}

      {primaryAction && secondaryAction ? (
        <View style={styles.alertActions}>
          <AlertActionButton label={secondaryAction.label} tone="neutral" onPress={secondaryAction.onPress} />
          <AlertActionButton label={primaryAction.label} tone="review" onPress={primaryAction.onPress} />
        </View>
      ) : null}
    </View>
  );
}

export function AdminOperationalAlertsSection({
  stockStatus,
  pendingProducts,
  pendingPayouts,
  totalOrders,
  pendingOrders,
  errors,
  onRetry,
  onRestockPress,
  onLowStockPress,
  onPendingProductsPress,
  onPendingPayoutsPress,
  onPendingOrdersPress,
}: AdminOperationalAlertsSectionProps) {
  const outOfStockCount = formatAdminOptionalCount(stockStatus?.outOfStockCount);
  const lowStockCount = formatAdminCount(stockStatus?.lowStockCount, '0');
  const hasAnyError = Object.values(errors).some(Boolean);

  const outOfStockNumber = Number(stockStatus?.outOfStockCount ?? 0);
  const lowStockNumber = Number(stockStatus?.lowStockCount ?? 0);
  const pendingProductNumber = Number(pendingProducts?.pendingProductCount ?? 0);
  const pendingOrderNumber = Number(pendingOrders?.pendingOrdersCount ?? 0);

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Operational Alerts" icon="warning-outline" />

      <View style={styles.stack}>
          <AlertCard
            tone="critical"
            title="Out of Stock"
            message={
              outOfStockNumber > 0
                ? `${outOfStockCount} critical item${outOfStockNumber === 1 ? '' : 's'} require attention.`
                : 'No critical out-of-stock items right now.'
            }
            icon="cube-outline"
            primaryAction={
              onRestockPress && outOfStockNumber > 0
                ? { label: 'Restock Now', onPress: onRestockPress, fullWidth: true }
                : undefined
            }
          />

          <AlertCard
            tone="warning"
            title="Low Stock"
            message={
              lowStockNumber > 0
                ? `${lowStockCount} item${lowStockNumber === 1 ? '' : 's'} dipping below threshold.`
                : 'Inventory levels are above the low-stock threshold.'
            }
            icon="trending-down-outline"
            secondaryAction={
              onLowStockPress && lowStockNumber > 0
                ? { label: 'View All', onPress: onLowStockPress }
                : undefined
            }
            primaryAction={
              onLowStockPress && lowStockNumber > 0
                ? { label: 'Review', onPress: onLowStockPress }
                : undefined
            }
          />

          {(pendingProductNumber > 0 || pendingOrderNumber > 0) && (
            <View style={styles.pendingCard}>
              <AppText variant="bodyMedium" style={styles.pendingTitle}>
                Pending review
              </AppText>
              <View style={styles.pendingRows}>
                {pendingProductNumber > 0 ? (
                  <Pressable accessibilityRole="button" onPress={onPendingProductsPress} style={styles.pendingRow}>
                    <AppText variant="bodySmall" color="textSecondary">
                      Products awaiting approval
                    </AppText>
                    <AppText variant="bodyMedium" style={styles.pendingValue}>
                      {formatAdminOptionalCount(pendingProducts?.pendingProductCount)}
                    </AppText>
                  </Pressable>
                ) : null}
                {pendingOrderNumber > 0 ? (
                  <Pressable accessibilityRole="button" onPress={onPendingOrdersPress} style={styles.pendingRow}>
                    <AppText variant="bodySmall" color="textSecondary">
                      Orders awaiting action
                    </AppText>
                    <AppText variant="bodyMedium" style={styles.pendingValue}>
                      {formatAdminOptionalCount(pendingOrders?.pendingOrdersCount)}
                    </AppText>
                  </Pressable>
                ) : null}
                {Number(pendingPayouts?.pendingPayoutsCount ?? 0) > 0 ? (
                  <Pressable accessibilityRole="button" onPress={onPendingPayoutsPress} style={styles.pendingRow}>
                    <AppText variant="bodySmall" color="textSecondary">
                      Pending payouts
                    </AppText>
                    <AppText variant="bodyMedium" style={styles.pendingValue}>
                      {formatAdminOptionalCount(pendingPayouts?.pendingPayoutsCount)}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        </View>

      {hasAnyError ? (
        <ErrorState
          message={
            errors.stockStatus ??
            errors.pendingProducts ??
            errors.pendingPayouts ??
            errors.totalOrders ??
            errors.pendingOrders ??
            'Failed to load operational alerts'
          }
          onAction={onRetry}
          style={styles.error}
        />
      ) : null}
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
    borderRadius: adminDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: adminDashboardTheme.cardBackground,
    ...shadows.card,
  },
  criticalCard: {
    backgroundColor: adminDashboardTheme.alertCriticalCardBackground,
    borderColor: colors.errorBorder,
  },
  warningCard: {
    backgroundColor: adminDashboardTheme.alertWarningCardBackground,
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
  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionFullWidth: {
    flex: undefined,
    width: '100%',
  },
  actionCritical: {
    backgroundColor: adminDashboardTheme.alertCriticalButton,
  },
  actionReview: {
    backgroundColor: adminDashboardTheme.alertReviewButton,
  },
  actionNeutral: {
    backgroundColor: adminDashboardTheme.alertViewAllBackground,
  },
  actionCriticalLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  actionReviewLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  actionNeutralLabel: {
    color: adminDashboardTheme.alertViewAllText,
    fontWeight: '700',
  },
  pendingCard: {
    borderRadius: adminDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: adminDashboardTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  pendingTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pendingRows: {
    gap: spacing.sm,
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
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
