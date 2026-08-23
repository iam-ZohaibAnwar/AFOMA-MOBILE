import { StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../components/ui/AppBadge';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { Product } from '../../../services/types/product';

export interface ProductTypeInfoProps {
  product: Product;
}

export function ProductTypeInfo({ product }: ProductTypeInfoProps) {
  if (product.productType === 'Downloadable') {
    const downloadLimit = product.downloadableLink?.downloadLimit;

    return (
      <View style={styles.container}>
        <AppBadge label="Downloadable" variant="primary" />
        <AppText variant="bodySmall" color="textMuted">
          Digital product — no shipping required.
        </AppText>
        {downloadLimit !== undefined && downloadLimit !== null && String(downloadLimit).trim() ? (
          <AppText variant="bodySmall" color="textSecondary">
            Download limit: {String(downloadLimit)}
          </AppText>
        ) : null}
      </View>
    );
  }

  if (product.productType === 'Customizable') {
    return (
      <View style={styles.container}>
        <AppBadge label="Customizable" variant="neutral" />
        <AppText variant="bodySmall" color="textMuted">
          Select all options before adding to cart.
        </AppText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
});
