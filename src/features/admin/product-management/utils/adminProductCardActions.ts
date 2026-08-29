import type { AdminProductDetail, AdminProductListItem } from '../types/adminProductManagement';
import { canAdminPreviewProductInApp } from './adminProductPreviewNavigation';
import { canAdminEditProductType } from './adminProductWriteNavigation';
import {
  validateAdminProductDuplicatable,
} from './adminProductDuplicatePayload';
import type { AdminProductCardAction } from '../components/AdminProductCardActionsMenu';

export function buildAdminProductCardActions(product: AdminProductListItem): AdminProductCardAction[] {
  const isActive = product.status === 1;
  const canEdit = canAdminEditProductType(product.productType);
  const canPreview = canAdminPreviewProductInApp(product);
  const canDuplicate = validateAdminProductDuplicatable(product).canDuplicate;

  return [
    { id: 'delete', label: 'Delete', destructive: true },
    isActive
      ? { id: 'disable', label: 'Disable' }
      : { id: 'enable', label: 'Enable' },
    { id: 'view', label: 'View' },
    { id: 'edit', label: 'Edit', disabled: !canEdit },
    { id: 'preview', label: 'Preview', disabled: !canPreview },
    { id: 'duplicate', label: 'Duplicate', disabled: !canDuplicate },
  ];
}

export function buildAdminProductDetailMenuActions(
  product: AdminProductDetail,
  options: { canEditVariations: boolean },
): AdminProductCardAction[] {
  const canEdit = canAdminEditProductType(product.productType);
  const canDuplicate = validateAdminProductDuplicatable(product).canDuplicate;

  const actions: AdminProductCardAction[] = [
    { id: 'edit', label: 'Edit product', disabled: !canEdit },
  ];

  if (options.canEditVariations) {
    actions.push({ id: 'editVariations', label: 'Edit variations' });
  }

  actions.push(
    { id: 'duplicate', label: 'Duplicate product', disabled: !canDuplicate },
    { id: 'delete', label: 'Delete product', destructive: true },
  );

  return actions;
}
