import type { Product } from '../../../../services/types/product';
import { canSubmitProductForReview } from '../api/sellerProductsApi';
import type { SellerProductCardAction } from '../components/SellerProductCardActionsMenu';

export function buildSellerProductCardActions(product: Product): SellerProductCardAction[] {
  const isActive = product.status === 1;
  const canSubmit = canSubmitProductForReview(product.productStatus);

  const actions: SellerProductCardAction[] = [
    { id: 'edit', label: 'Edit' },
  ];

  if (canSubmit) {
    actions.push({ id: 'submitForReview', label: 'Submit for review' });
  }

  actions.push(
    isActive
      ? { id: 'deactivate', label: 'Deactivate' }
      : { id: 'activate', label: 'Activate' },
    { id: 'delete', label: 'Delete', destructive: true },
  );

  return actions;
}
