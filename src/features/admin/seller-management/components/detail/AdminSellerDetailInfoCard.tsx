import { AdminProductDetailCardShell, AdminProductDetailMetricRow } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminSellerListItem } from '../../types/adminSellerManagement';
import {
  formatAdminSellerJoinedDate,
  formatAdminSellerLocation,
} from '../../utils/adminSellerDisplay';

export function AdminSellerDetailInfoCard({ seller }: { seller: AdminSellerListItem }) {
  const phone = seller.phone?.trim() || '—';
  const location = formatAdminSellerLocation(seller);
  const joined = formatAdminSellerJoinedDate(seller.createdAt);
  const shopSlug = seller.storeSlug?.trim() || seller.slug?.trim() || '—';

  return (
    <AdminProductDetailCardShell title="Seller Information" icon="information-circle-outline" iconVariant="solid">
      <AdminProductDetailMetricRow label="Phone" value={phone} />
      <AdminProductDetailMetricRow label="Location" value={location} />
      <AdminProductDetailMetricRow label="Joined" value={joined} />
      <AdminProductDetailMetricRow label="Shop slug" value={shopSlug} />
    </AdminProductDetailCardShell>
  );
}
