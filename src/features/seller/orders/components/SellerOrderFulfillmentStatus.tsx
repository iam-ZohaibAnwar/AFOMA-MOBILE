import { SelectField } from '../../../../components/forms';
import { AppText } from '../../../../components/ui/AppText';
import type { CartLineItem } from '../../../../services/types/cart';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type { SellerLineFulfillmentStatus } from '../types/sellerOrder';
import {
  SELLER_LINE_FULFILLMENT_OPTIONS,
  canUpdateLineFulfillmentStatus,
  formatSellerLineFulfillmentStatus,
} from '../utils/sellerOrderMappers';

export interface SellerOrderFulfillmentStatusProps {
  order: SellerOrderDetail;
  line: CartLineItem;
  isUpdating?: boolean;
  onChange: (status: SellerLineFulfillmentStatus) => void;
}

export function SellerOrderFulfillmentStatus({
  order,
  line,
  isUpdating = false,
  onChange,
}: SellerOrderFulfillmentStatusProps) {
  const currentStatus = line.productData?.shippingStatus ?? '';
  const canUpdate = canUpdateLineFulfillmentStatus(order, line);

  if (line.productData?.productType === 'Downloadable') {
    return (
      <AppText variant="bodySmall" color="textMuted">
        Not applicable for downloadable products
      </AppText>
    );
  }

  if (!canUpdate) {
    return (
      <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
        {formatSellerLineFulfillmentStatus(currentStatus)}
      </AppText>
    );
  }

  return (
    <SelectField
      label="Fulfillment status"
      value={currentStatus === 'Dispatch' ? 'Dispatch' : currentStatus}
      options={SELLER_LINE_FULFILLMENT_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      }))}
      onChange={(value) => onChange(value as SellerLineFulfillmentStatus)}
      disabled={isUpdating}
      modalTitle="Update fulfillment status"
    />
  );
}
