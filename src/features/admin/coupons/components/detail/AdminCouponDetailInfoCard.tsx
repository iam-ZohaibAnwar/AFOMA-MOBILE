import { AdminProductDetailCardShell, AdminProductDetailMetricRow } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminCouponListItem } from '../../types/adminCoupons';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
  getAdminCouponCreatorName,
} from '../../utils/adminCouponsContent';
import { formatAdminCouponUsage } from '../../utils/adminCouponsDisplay';

export function AdminCouponDetailInfoCard({
  coupon,
  showCreator = false,
}: {
  coupon: AdminCouponListItem;
  showCreator?: boolean;
}) {
  return (
    <AdminProductDetailCardShell title="Coupon details" icon="gift-outline" iconVariant="solid">
      {showCreator ? (
        <AdminProductDetailMetricRow label="Created by" value={getAdminCouponCreatorName(coupon)} />
      ) : null}
      <AdminProductDetailMetricRow label="Type" value={formatAdminCouponType(coupon.couponType)} />
      <AdminProductDetailMetricRow label="Discount" value={formatAdminCouponDiscount(coupon)} />
      <AdminProductDetailMetricRow
        label="Minimum cart"
        value={coupon.minimumCartAmount != null ? String(coupon.minimumCartAmount) : '—'}
      />
      <AdminProductDetailMetricRow
        label="Expires"
        value={formatAdminCouponExpirationDate(coupon.expirationDate)}
      />
      <AdminProductDetailMetricRow label="Usage" value={formatAdminCouponUsage(coupon)} />
      <AdminProductDetailMetricRow
        label="Per customer limit"
        value={coupon.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : '—'}
      />
      {coupon.description?.trim() ? (
        <AdminProductDetailMetricRow label="Description" value={coupon.description.trim()} />
      ) : null}
    </AdminProductDetailCardShell>
  );
}
