import { useState } from 'react';

import { AppButton } from '../../../../components/ui/AppButton';
import { ProductShippingEstimateSheet } from './ProductShippingEstimateSheet';
import type { ProductShippingEstimatePrefill } from '../types/productShippingEstimate';

export interface ProductShippingEstimateTriggerProps {
  sellerId?: string;
  prefill: ProductShippingEstimatePrefill;
  price?: string;
}

export function ProductShippingEstimateTrigger({
  sellerId,
  prefill,
  price,
}: ProductShippingEstimateTriggerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <AppButton
        label="Get shipping estimate"
        variant="outline"
        onPress={() => setVisible(true)}
      />
      <ProductShippingEstimateSheet
        visible={visible}
        sellerId={sellerId}
        prefill={prefill}
        price={price}
        onClose={() => setVisible(false)}
      />
    </>
  );
}
