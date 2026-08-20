import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { CartLineItem } from '../../../services/types/cart';
import type { OrderDetail } from '../../../services/types/order';
import { getProductDisplayName, getProductImageUrl } from '../../products/utils/productDisplay';
import {
  calculateOrderItemLineTotal,
  calculateOrderItemUnitPrice,
  formatOrderMoney,
} from '../utils/orderPricing';

interface OrderLineItemRowProps {
  line: CartLineItem;
  order: OrderDetail;
}

export function OrderLineItemRow({ line, order }: OrderLineItemRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const imageUrl = product ? getProductImageUrl(product) : undefined;
  const quantity = line.orderQuantiy ?? 0;
  const unitPrice = calculateOrderItemUnitPrice(line, order);
  const lineTotal = calculateOrderItemLineTotal(line, order);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No image</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {product ? getProductDisplayName(product) : 'Product'}
        </Text>
        <Text style={styles.meta}>Qty: {quantity || '—'}</Text>
        <Text style={styles.meta}>Unit: {formatOrderMoney(order, unitPrice)}</Text>
        <Text style={styles.lineTotal}>Total: {formatOrderMoney(order, lineTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  imageWrap: {
    width: 72,
    height: 72,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172554',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
  },
});
