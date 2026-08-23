import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type {
  AdminPendingOrdersCount,
  AdminPendingPayoutCount,
  AdminPendingProductCount,
  AdminProductStockStatus,
  AdminSellerTotalCount,
  AdminTotalOrdersCount,
} from '../types/adminDashboard';
import { formatAdminCount, formatAdminOptionalCount } from '../utils/adminDashboardDisplay';

export interface AdminOperationsSectionProps {
  stockStatus: AdminProductStockStatus | null;
  sellerCount: AdminSellerTotalCount | null;
  pendingProducts: AdminPendingProductCount | null;
  pendingPayouts: AdminPendingPayoutCount | null;
  totalOrders: AdminTotalOrdersCount | null;
  pendingOrders: AdminPendingOrdersCount | null;
  isLoading: boolean;
  errors: {
    stockStatus?: string;
    sellerCount?: string;
    pendingProducts?: string;
    pendingPayouts?: string;
    totalOrders?: string;
    pendingOrders?: string;
  };
  onRetry?: () => void;
  onPendingProductsPress?: () => void;
  onPendingPayoutsPress?: () => void;
}

function OperationRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <AppText variant="bodyMedium" color={onPress ? 'textLink' : 'textSecondary'}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.value}>
        {value}
      </AppText>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      {content}
    </Pressable>
  );
}

export function AdminOperationsSection({
  stockStatus,
  sellerCount,
  pendingProducts,
  pendingPayouts,
  totalOrders,
  pendingOrders,
  isLoading,
  errors,
  onRetry,
  onPendingProductsPress,
  onPendingPayoutsPress,
}: AdminOperationsSectionProps) {
  const hasAnyError = Object.values(errors).some(Boolean);
  const showLoading =
    isLoading &&
    !stockStatus &&
    !sellerCount &&
    !pendingProducts &&
    !pendingPayouts &&
    !totalOrders &&
    !pendingOrders;

  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium" style={styles.title}>
        Operations
      </AppText>

      <AppCard variant="muted">
        {showLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.list}>
            <OperationRow
              label="Out of Stock"
              value={formatAdminOptionalCount(stockStatus?.outOfStockCount)}
            />
            <OperationRow
              label="Low Stock"
              value={formatAdminCount(stockStatus?.lowStockCount, '0')}
            />
            <OperationRow
              label="Pending Products"
              value={formatAdminOptionalCount(pendingProducts?.pendingProductCount)}
              onPress={onPendingProductsPress}
            />
            <OperationRow
              label="Pending Payouts"
              value={formatAdminOptionalCount(pendingPayouts?.pendingPayoutsCount)}
              onPress={onPendingPayoutsPress}
            />
            <OperationRow
              label="Total Orders"
              value={formatAdminCount(totalOrders?.totalOrders)}
            />
            <OperationRow
              label="Pending Orders"
              value={formatAdminOptionalCount(pendingOrders?.pendingOrdersCount)}
            />
          </View>
        )}

        {hasAnyError ? (
          <ErrorState
            message={
              errors.stockStatus ??
              errors.sellerCount ??
              errors.pendingProducts ??
              errors.pendingPayouts ??
              errors.totalOrders ??
              errors.pendingOrders ??
              'Failed to load operations metrics'
            }
            onAction={onRetry}
            style={styles.error}
          />
        ) : null}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  error: {
    marginHorizontal: 0,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
