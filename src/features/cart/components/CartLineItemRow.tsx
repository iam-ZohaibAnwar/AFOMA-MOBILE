import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CartLineItem } from '../../../services/types/cart';
import {
  formatProductPrice,
  getProductDisplayName,
  getProductImageUrl,
  getProductPrice,
} from '../../products/utils/productDisplay';

interface CartLineItemRowProps {
  itemId: string;
  line: CartLineItem;
  onRemove?: (itemId: string) => void;
  isRemoving?: boolean;
  showRemove?: boolean;
}

function getLineUnitPrice(line: CartLineItem): number | undefined {
  if (typeof line.basePrice === 'number' && Number.isFinite(line.basePrice)) {
    return line.basePrice;
  }

  return getProductPrice(line.productData ?? {});
}

function getLineTotal(line: CartLineItem, unitPrice: number | undefined): number | undefined {
  if (typeof line.totalAmount === 'number' && Number.isFinite(line.totalAmount)) {
    return line.totalAmount;
  }

  const quantity = line.orderQuantiy ?? 0;
  if (unitPrice === undefined) {
    return undefined;
  }

  return unitPrice * quantity;
}

export function CartLineItemRow({
  itemId,
  line,
  onRemove,
  isRemoving,
  showRemove = true,
}: CartLineItemRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const imageUrl = product ? getProductImageUrl(product) : undefined;
  const unitPrice = getLineUnitPrice(line);
  const lineTotal = getLineTotal(line, unitPrice);
  const quantity = line.orderQuantiy ?? 0;

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
        <Text style={styles.meta}>Qty: {quantity}</Text>
        <Text style={styles.meta}>Unit: {formatProductPrice(unitPrice)}</Text>
        <Text style={styles.lineTotal}>Total: {formatProductPrice(lineTotal)}</Text>

        {showRemove ? (
          <Pressable
            style={[styles.removeButton, isRemoving && styles.removeButtonDisabled]}
            disabled={isRemoving}
            onPress={() => onRemove?.(itemId)}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#B91C1C" />
            ) : (
              <Text style={styles.removeButtonText}>Remove</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  imageWrap: {
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFEDD5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
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
    fontWeight: '600',
    color: '#172554',
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    color: '#64748B',
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    minWidth: 84,
    alignItems: 'center',
  },
  removeButtonDisabled: {
    opacity: 0.7,
  },
  removeButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});
