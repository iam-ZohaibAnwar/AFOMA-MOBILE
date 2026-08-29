import { Alert, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { CartLineItem } from '../../../../services/types/cart';
import { getProductDisplayName } from '../../../products/utils/productDisplay';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import { formatAdminLineFulfillmentStatus } from '../utils/adminOrderDetailDisplay';
import {
  buildAdminLineFulfillmentOptions,
  canUpdateAdminLineFulfillment,
  isDestructiveAdminLineFulfillment,
} from '../utils/adminOrderOperations';

interface AdminOrderLineFulfillmentSectionProps {
  order: AdminOrderDetail;
  lines: CartLineItem[];
  updatingProductId?: string;
  onFulfillmentStatusChange: (productId: string, shippingStatus: string) => void;
}

export function AdminOrderLineFulfillmentSection({
  order,
  lines,
  updatingProductId,
  onFulfillmentStatusChange,
}: AdminOrderLineFulfillmentSectionProps) {
  const editableLines = lines.filter((line) => canUpdateAdminLineFulfillment(order, line));

  if (!editableLines.length) {
    return null;
  }

  return (
    <OrderDetailCollapsibleSection
      title="Line Fulfillment"
      icon="git-branch-outline"
      collapsedPreview={
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {editableLines.length} item{editableLines.length === 1 ? '' : 's'}
        </AppText>
      }
    >
      <View style={styles.list}>
        {editableLines.map((line, index) => {
          const product = line.productData;
          const productId = product?._id;
          const currentShippingStatus = product?.shippingStatus ?? '';
          const fulfillmentOptions = buildAdminLineFulfillmentOptions(currentShippingStatus);
          const label = product ? getProductDisplayName(product) : `Item ${index + 1}`;

          const handleChange = (nextStatus: string) => {
            if (!productId || nextStatus === currentShippingStatus) {
              return;
            }

            const applyStatus = () => {
              onFulfillmentStatusChange(productId, nextStatus);
            };

            if (isDestructiveAdminLineFulfillment(nextStatus)) {
              Alert.alert(
                'Cancel this line item?',
                'This will set the line fulfillment status to Cancelled.',
                [
                  { text: 'Keep item', style: 'cancel' },
                  { text: 'Cancel item', style: 'destructive', onPress: applyStatus },
                ],
              );
              return;
            }

            applyStatus();
          };

          return (
            <View key={`${productId ?? 'line'}-${index}`} style={styles.row}>
              <View style={styles.copy}>
                <AppText variant="bodySmall" numberOfLines={1} style={styles.productName}>
                  {label}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Current: {formatAdminLineFulfillmentStatus(line)}
                </AppText>
              </View>
              <View style={styles.selectWrap}>
                <SelectField
                  value={currentShippingStatus === 'Dispatch' ? 'Dispatch' : currentShippingStatus}
                  options={fulfillmentOptions}
                  onChange={handleChange}
                  disabled={updatingProductId === productId}
                  modalTitle="Change fulfillment status"
                />
              </View>
            </View>
          );
        })}
      </View>
    </OrderDetailCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.sm,
  },
  copy: {
    gap: 2,
  },
  productName: {
    fontWeight: '700',
  },
  selectWrap: {
    width: '100%',
  },
});
