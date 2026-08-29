import type { AdminProductCardAction } from '../../product-management/components/AdminProductCardActionsMenu';

export function buildAdminUserCardActions(): AdminProductCardAction[] {
  return [
    { id: 'view', label: 'View user' },
    { id: 'edit', label: 'Edit user' },
    { id: 'delete', label: 'Delete user', destructive: true },
  ];
}
