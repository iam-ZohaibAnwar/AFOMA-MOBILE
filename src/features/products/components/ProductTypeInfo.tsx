import { AppBadge } from '../../../components/ui/AppBadge';
import type { Product } from '../../../services/types/product';

export interface ProductTypeTagsProps {
  productType?: Product['productType'];
}

export function ProductTypeTags({ productType }: ProductTypeTagsProps) {
  if (productType === 'Downloadable') {
    return <AppBadge label="Downloadable" variant="primary" />;
  }

  if (productType === 'Customizable') {
    return <AppBadge label="Customizable" variant="primary" />;
  }

  return null;
}
