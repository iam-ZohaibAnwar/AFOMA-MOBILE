import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import type { AdminSellerApprovalStatus, AdminSellerListItem } from '../types/adminSellerManagement';

export function getAdminSellerDisplayName(seller: Pick<AdminSellerListItem, 'firstName' | 'lastName' | 'storeTitle'>): string {
  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  if (seller.storeTitle?.trim()) {
    return seller.storeTitle.trim();
  }

  return 'Unnamed seller';
}

export function isAdminSellerShopVisible(
  seller?: Pick<AdminSellerListItem, 'shop_status'> | null,
): boolean {
  return Number(seller?.shop_status) !== 0;
}

export function getAdminSellerShopVisibilityLabel(
  seller?: Pick<AdminSellerListItem, 'shop_status'> | null,
): 'Visible' | 'Hidden' {
  return isAdminSellerShopVisible(seller) ? 'Visible' : 'Hidden';
}

export function formatAdminSellerApprovalStatus(status?: AdminSellerApprovalStatus): string {
  if (!status?.trim()) {
    return 'Pending';
  }

  return status.trim();
}

export function approvalStatusBadgeVariant(
  status?: AdminSellerApprovalStatus,
): NonNullable<AppBadgeProps['variant']> {
  const normalized = formatAdminSellerApprovalStatus(status);

  if (normalized === 'Approved') {
    return 'success';
  }

  if (normalized === 'Disapproved') {
    return 'warning';
  }

  return 'neutral';
}

export function shopVisibilityBadgeVariant(
  seller?: Pick<AdminSellerListItem, 'shop_status'> | null,
): NonNullable<AppBadgeProps['variant']> {
  return isAdminSellerShopVisible(seller) ? 'success' : 'neutral';
}
