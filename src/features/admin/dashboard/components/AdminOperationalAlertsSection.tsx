import { Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, shadows, spacing } from '../../../../design-system';
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

const LOW_STOCK_THRESHOLD = 5;

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

function InventoryStatCard({
  title,
  count,
  description,
  tone,
  onPress,
}: {
  title: string;
  count: number;
  description: string;
  tone: 'critical' | 'warning' | 'neutral';
  onPress?: () => void;
}) {
  const isActionable = count > 0 && Boolean(onPress);
  const toneStyles =
    tone === 'critical'
      ? styles.statCritical
      : tone === 'warning'
        ? styles.statWarning
        : styles.statNeutral;
  const countColor =
    tone === 'critical' ? colors.error : tone === 'warning' ? colors.warningText : colors.textPrimary;

  const content = (
    <>
      <AppText variant="bodyMedium" style={styles.statTitle}>
        {title}
      </AppText>
      <AppText variant="h2" style={[styles.statCount, { color: countColor }]}>
        {formatAdminCount(count)}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.statUnit}>
        {count === 1 ? 'product' : 'products'}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" style={styles.statDescription}>
        {description}
      </AppText>
      {isActionable ? (
        <AppText variant="bodySmall" color="textLink" style={styles.statAction}>
          Open product list
        </AppText>
      ) : null}
    </>
  );

  if (!isActionable) {
    return <View style={[styles.statCard, toneStyles]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, toneStyles, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
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
  const hasAnyError = Object.values(errors).some(Boolean);

  const outOfStockNumber = Number(stockStatus?.outOfStockCount ?? 0);
  const lowStockNumber = Number(stockStatus?.lowStockCount ?? 0);
  const pendingProductNumber = Number(pendingProducts?.pendingProductCount ?? 0);
  const pendingOrderNumber = Number(pendingOrders?.pendingOrdersCount ?? 0);

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Operational Alerts" icon="warning-outline" />

      <View style={styles.inventoryBlock}>
        <AppText variant="bodyMedium" style={styles.inventoryHeading}>
          Inventory overview
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.inventoryIntro}>
          How many marketplace products need inventory attention right now.
        </AppText>

        <View style={styles.inventoryGrid}>
          <InventoryStatCard
            title="Out of stock"
            count={outOfStockNumber}
            tone={outOfStockNumber > 0 ? 'critical' : 'neutral'}
            description={
              outOfStockNumber > 0
                ? 'Unavailable to buyers until stock status is updated.'
                : 'No products are currently marked out of stock.'
            }
            onPress={outOfStockNumber > 0 ? onRestockPress : undefined}
          />

          <InventoryStatCard
            title="Low stock"
            count={lowStockNumber}
            tone={lowStockNumber > 0 ? 'warning' : 'neutral'}
            description={
              lowStockNumber > 0
                ? `In-stock products with fewer than ${LOW_STOCK_THRESHOLD} units left.`
                : `No in-stock products are below ${LOW_STOCK_THRESHOLD} units.`
            }
            onPress={lowStockNumber > 0 ? onLowStockPress : undefined}
          />
        </View>
      </View>

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
  inventoryBlock: {
    gap: spacing.sm,
  },
  inventoryHeading: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inventoryIntro: {
    lineHeight: 20,
  },
  inventoryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: adminDashboardTheme.cardRadius,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: adminDashboardTheme.cardBackground,
    ...shadows.card,
  },
  statCritical: {
    backgroundColor: adminDashboardTheme.alertCriticalCardBackground,
    borderColor: colors.errorBorder,
  },
  statWarning: {
    backgroundColor: adminDashboardTheme.alertWarningCardBackground,
    borderColor: colors.border,
  },
  statNeutral: {
    borderColor: colors.border,
  },
  statTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statCount: {
    fontWeight: '700',
    lineHeight: 36,
  },
  statUnit: {
    textTransform: 'lowercase',
    marginTop: -spacing.xs,
  },
  statDescription: {
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  statAction: {
    marginTop: spacing.sm,
    fontWeight: '600',
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
