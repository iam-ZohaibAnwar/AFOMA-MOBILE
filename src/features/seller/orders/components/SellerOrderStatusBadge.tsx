import { AppBadge } from '../../../../components/ui/AppBadge';
import { formatSellerOrderStatus, orderStatusBadgeVariant } from '../utils/sellerOrderMappers';

export interface SellerOrderStatusBadgeProps {
  status?: string;
}

/** Order-level status badge — distinct from line fulfillment status. */
export function SellerOrderStatusBadge({ status }: SellerOrderStatusBadgeProps) {
  return (
    <AppBadge
      label={formatSellerOrderStatus(status)}
      variant={orderStatusBadgeVariant(status)}
    />
  );
}
