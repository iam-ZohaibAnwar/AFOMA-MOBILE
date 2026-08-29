import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { AdminSectionTitle } from '../../../admin/dashboard/components/AdminSectionTitle';
import type { SellerDashboardOrder } from '../types';
import { sellerDashboardTheme } from '../utils/sellerDashboardTheme';
import { SellerDashboardOrderRow } from './SellerDashboardOrderRow';

export interface SellerDashboardRecentOrdersSectionProps {
  orders: SellerDashboardOrder[];
  error?: string;
  onRetry?: () => void;
  onViewAllPress?: () => void;
  onOrderPress?: (order: SellerDashboardOrder) => void;
}

export function SellerDashboardRecentOrdersSection({
  orders,
  error,
  onRetry,
  onViewAllPress,
  onOrderPress,
}: SellerDashboardRecentOrdersSectionProps) {
  return (
    <View style={styles.section}>
      <AdminSectionTitle
        title="Recent orders"
        icon="receipt-outline"
        trailing={
          onViewAllPress ? (
            <Pressable accessibilityRole="button" onPress={onViewAllPress} hitSlop={8}>
              <AppText variant="bodySmall" color="textLink" style={styles.viewAll}>
                View all
              </AppText>
            </Pressable>
          ) : null
        }
      />

      <View style={styles.panel}>
        {error ? <ErrorState message={error} onAction={onRetry} style={styles.error} /> : null}

        {orders.length > 0 ? (
          <View style={styles.list}>
            {orders.map((order, index) => (
              <SellerDashboardOrderRow
                key={order._id ?? `order-${index}`}
                order={order}
                onPress={onOrderPress ? () => onOrderPress(order) : undefined}
                showDivider={index < orders.length - 1}
              />
            ))}
          </View>
        ) : !error ? (
          <EmptyState title="No orders received" message="Shop orders will appear here." style={styles.empty} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  viewAll: {
    fontWeight: '600',
  },
  panel: {
    borderRadius: sellerDashboardTheme.cardRadius,
    padding: spacing.lg,
    backgroundColor: sellerDashboardTheme.cardBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  list: {
    gap: 0,
  },
  empty: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  error: {
    marginHorizontal: 0,
    marginBottom: spacing.sm,
  },
});
