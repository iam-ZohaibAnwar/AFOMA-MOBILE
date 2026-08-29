import type { AdminProductCardAction } from '../../product-management/components/AdminProductCardActionsMenu';

export function buildAdminReviewCardActions(canPreviewProduct: boolean): AdminProductCardAction[] {
  return [
    { id: 'view', label: 'View details' },
    { id: 'edit', label: 'Change status' },
    { id: 'preview', label: 'View product', disabled: !canPreviewProduct },
  ];
}
