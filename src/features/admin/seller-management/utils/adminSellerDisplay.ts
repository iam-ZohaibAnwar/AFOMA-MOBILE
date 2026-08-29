import { colors } from '../../../../design-system';
import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import type {
  AdminSellerApprovalFilter,
  AdminSellerApprovalStatus,
  AdminSellerListItem,
  AdminSellerShopFilter,
} from '../types/adminSellerManagement';

export type AdminSellerListTabId =
  | 'all'
  | 'approved'
  | 'pending'
  | 'disapproved'
  | 'visible'
  | 'hidden';

export interface AdminSellerListTab {
  id: AdminSellerListTabId;
  label: string;
  approval: AdminSellerApprovalFilter;
  shop: AdminSellerShopFilter;
}

export const ADMIN_SELLER_LIST_TABS: AdminSellerListTab[] = [
  { id: 'all', label: 'All', approval: '', shop: '' },
  { id: 'approved', label: 'Approved', approval: 'Approved', shop: '' },
  { id: 'pending', label: 'Pending', approval: 'Pending', shop: '' },
  { id: 'disapproved', label: 'Disapproved', approval: 'Disapproved', shop: '' },
  { id: 'visible', label: 'Visible', approval: '', shop: 'Active' },
  { id: 'hidden', label: 'Hidden', approval: '', shop: 'Inactive' },
];

export const ADMIN_SELLER_LIST_TAB_OPTIONS = ADMIN_SELLER_LIST_TABS.map(({ id, label }) => ({
  label,
  value: id,
}));

export function getAdminSellerListTab(tabId: AdminSellerListTabId): AdminSellerListTab {
  const tab = ADMIN_SELLER_LIST_TABS.find((entry) => entry.id === tabId);
  return tab ?? ADMIN_SELLER_LIST_TABS[0];
}

export function resolveAdminSellerListTabId(
  approvalFilter: AdminSellerApprovalFilter,
  shopFilter: AdminSellerShopFilter,
): AdminSellerListTabId | null {
  const match = ADMIN_SELLER_LIST_TABS.find(
    (tab) => tab.approval === approvalFilter && tab.shop === shopFilter,
  );
  return match?.id ?? null;
}

export interface AdminSellerStatusChip {
  id: string;
  label: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export function resolveAdminSellerAccentColor(
  seller: Pick<AdminSellerListItem, 'status' | 'shop_status'>,
): string {
  const approval = formatAdminSellerApprovalStatus(seller.status);

  if (approval === 'Approved') {
    return colors.success;
  }

  if (approval === 'Disapproved') {
    return colors.error;
  }

  if (!isAdminSellerShopVisible(seller)) {
    return colors.textMuted;
  }

  return colors.primary;
}

export function getAdminSellerListSubtitle(seller: AdminSellerListItem): string {
  const shop = seller.storeTitle?.trim();
  const email = seller.email?.trim();

  if (shop && email) {
    return `${shop} · ${email}`;
  }

  return shop || email || 'No shop or email';
}

export function resolveAdminSellerListStatusChips(
  seller: Pick<AdminSellerListItem, 'status' | 'shop_status'>,
): AdminSellerStatusChip[] {
  const chips: AdminSellerStatusChip[] = [];
  const approval = formatAdminSellerApprovalStatus(seller.status);

  chips.push({
    id: 'approval',
    label: approval,
    icon: approval === 'Approved' ? 'checkmark-circle-outline' : 'time-outline',
    tone:
      approval === 'Approved'
        ? 'success'
        : approval === 'Disapproved'
          ? 'warning'
          : 'neutral',
  });

  chips.push({
    id: 'shop',
    label: isAdminSellerShopVisible(seller) ? 'Visible' : 'Hidden',
    icon: isAdminSellerShopVisible(seller) ? 'eye-outline' : 'eye-off-outline',
    tone: isAdminSellerShopVisible(seller) ? 'info' : 'neutral',
  });

  return chips;
}

export function formatAdminSellerJoinedDate(value?: string): string {
  if (!value?.trim()) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.trim();
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

export function formatAdminSellerLocation(
  seller: Pick<AdminSellerListItem, 'city' | 'state' | 'country'>,
): string {
  const parts = [seller.city, seller.state, seller.country].filter(Boolean).map((part) => part?.trim());
  return parts.length > 0 ? parts.join(', ') : '—';
}

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
