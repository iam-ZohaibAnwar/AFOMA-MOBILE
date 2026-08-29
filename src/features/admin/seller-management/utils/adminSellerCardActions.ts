import type { AdminProductCardAction } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import { isAdminSellerShopVisible } from './adminSellerDisplay';

export function buildAdminSellerCardActions(seller: AdminSellerListItem): AdminProductCardAction[] {
  const isVisible = isAdminSellerShopVisible(seller);

  return [
    { id: 'view', label: 'View seller' },
    { id: 'edit', label: 'Edit basic info' },
    isVisible ? { id: 'disable', label: 'Hide shop' } : { id: 'enable', label: 'Show shop' },
    { id: 'delete', label: 'Delete seller', destructive: true },
  ];
}
