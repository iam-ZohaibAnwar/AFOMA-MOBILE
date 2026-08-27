import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { QuantityStepper } from '../../../components/ecommerce/QuantityStepper';
import { AppText } from '../../../components/ui/AppText';
import { DeleteIcon } from '../../../components/ui/DeleteIcon';
import { colors, radius, spacing } from '../../../design-system';
import { motion } from '../../../design-system/motion';
import type { CartLineItem } from '../../../services/types/cart';
import { getCartLineAttributes } from '../utils/cartUtils';
import {
  formatProductPrice,
  getProductDisplayName,
  getProductImageUrl,
} from '../../products/utils/productDisplay';
import { parseMaxQuantity } from '../utils/cartLineMerge';

export interface CartLineItemRowProps {
  itemId: string;
  line: CartLineItem;
  currency?: string;
  displayLineTotal?: number;
  selected?: boolean;
  onToggleSelect?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
  onQuantityChange?: (itemId: string, nextQuantity: number) => void;
  onEditVariations?: (itemId: string) => void;
  isRemoving?: boolean;
  isUpdating?: boolean;
  showRemove?: boolean;
  showQuantityControls?: boolean;
  emphasized?: boolean;
}

function toDisplayAmount(amount: number | undefined): number | undefined {
  if (amount === undefined || !Number.isFinite(amount)) {
    return undefined;
  }

  return parseFloat(amount.toFixed(2));
}

export function CartLineItemRow({
  itemId,
  line,
  currency = 'CAD',
  displayLineTotal,
  selected = true,
  onToggleSelect,
  onRemove,
  onQuantityChange,
  onEditVariations,
  isRemoving,
  isUpdating,
  showRemove = false,
  showQuantityControls = true,
  emphasized = false,
}: CartLineItemRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const highlightProgress = useRef(new Animated.Value(0)).current;
  const product = line.productData;
  const imageUrl = product ? getProductImageUrl(product) : undefined;
  const quantity = line.orderQuantiy ?? 0;
  const lineTotal = toDisplayAmount(displayLineTotal ?? line.totalAmount);
  const attributes = getCartLineAttributes(line);
  const maxQuantity = parseMaxQuantity(line.maxQuantity, product?.quantity);
  const isDownloadable = product?.productType === 'Downloadable';
  const isCustomizable = product?.productType === 'Customizable';
  const isBusy = isRemoving || isUpdating;

  useEffect(() => {
    if (!emphasized) {
      highlightProgress.setValue(0);
      return;
    }

    highlightProgress.setValue(0);
    Animated.sequence([
      Animated.timing(highlightProgress, {
        toValue: 1,
        duration: motion.contentFadeMs,
        useNativeDriver: false,
      }),
      Animated.timing(highlightProgress, {
        toValue: 0.35,
        duration: motion.majorTransitionMs,
        useNativeDriver: false,
      }),
      Animated.timing(highlightProgress, {
        toValue: 0,
        duration: motion.screenEnterMs,
        useNativeDriver: false,
      }),
    ]).start();
  }, [emphasized, highlightProgress]);

  const emphasisBackground = highlightProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(31, 98, 142, 0)', colors.primarySoft],
  });

  const emphasisBorder = highlightProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(31, 98, 142, 0)', colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        styles.emphasisWrap,
        emphasized
          ? {
              backgroundColor: emphasisBackground,
              borderColor: emphasisBorder,
            }
          : undefined,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        disabled={!onToggleSelect || isBusy}
        onPress={() => onToggleSelect?.(itemId)}
        style={({ pressed }) => [
          styles.checkbox,
          selected && styles.checkboxSelected,
          pressed && styles.pressed,
        ]}
      >
        {selected ? <AppText variant="caption" style={styles.checkmark}>✓</AppText> : null}
      </Pressable>

      <View style={styles.imageWrap}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <AppText variant="bodyMedium" numberOfLines={2} style={styles.name}>
              {product ? getProductDisplayName(product) : 'Product'}
            </AppText>
            {attributes ? (
              <AppText variant="bodySmall" color="textMuted">
                {attributes}
              </AppText>
            ) : null}
            {isCustomizable && onEditVariations ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change product options"
                disabled={isBusy}
                onPress={() => onEditVariations(itemId)}
                hitSlop={4}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AppText variant="bodySmall" color="textLink">
                  Change options
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <AppText variant="bodyMedium" style={styles.price}>
            {formatProductPrice(lineTotal, currency)}
          </AppText>
        </View>

        <View style={styles.bottomRow}>
          {showQuantityControls && !isDownloadable ? (
            <QuantityStepper
              value={quantity}
              min={1}
              max={Number.isFinite(maxQuantity) ? maxQuantity : undefined}
              disabled={isBusy}
              size="compact"
              onDecrement={() => onQuantityChange?.(itemId, quantity - 1)}
              onIncrement={() => onQuantityChange?.(itemId, quantity + 1)}
              style={styles.stepper}
            />
          ) : (
            <AppText variant="caption" color="textMuted">
              Qty: {quantity}
            </AppText>
          )}

          {showRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove item"
              disabled={isBusy}
              onPress={() => onRemove?.(itemId)}
              hitSlop={8}
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <DeleteIcon color={colors.textMuted} size={18} />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  emphasisWrap: {
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.large,
    overflow: 'hidden',
    backgroundColor: colors.disabledBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.disabledBg,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepper: {
    borderWidth: 0,
    backgroundColor: colors.disabledBg,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
