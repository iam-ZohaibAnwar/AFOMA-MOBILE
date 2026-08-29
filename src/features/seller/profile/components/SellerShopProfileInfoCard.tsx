import { AdminProductDetailCardShell, AdminProductDetailMetricRow } from '../../../admin/product-management/components/detail/AdminProductDetailCardShell';
import type { SellerProfile } from '../../types/sellerProfile';
import { formatSellerLocation, formatSellerShopSlug } from '../utils/sellerProfileDisplay';

export interface SellerShopProfileInfoCardProps {
  profile?: SellerProfile | null;
}

export function SellerShopProfileInfoCard({ profile }: SellerShopProfileInfoCardProps) {
  const phone = profile?.phone?.trim() || '—';
  const location = formatSellerLocation(profile);
  const shopSlug = formatSellerShopSlug(profile);

  return (
    <AdminProductDetailCardShell title="Shop information" icon="information-circle-outline" iconVariant="solid">
      <AdminProductDetailMetricRow label="Phone" value={phone} />
      <AdminProductDetailMetricRow label="Location" value={location} />
      <AdminProductDetailMetricRow label="Shop slug" value={shopSlug} />
    </AdminProductDetailCardShell>
  );
}
