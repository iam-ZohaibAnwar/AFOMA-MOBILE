import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { QuantityStepper } from '../../../components/ecommerce/QuantityStepper';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
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
    outputRange: [colors.surfaceWhite, colors.primarySoft],
  });

  const emphasisBorder = highlightProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderStrong, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        emphasized
          ? {
              backgroundColor: emphasisBackground,
              borderColor: emphasisBorder,
            }
          : undefined,
      ]}
    >
      {onToggleSelect ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected }}
          disabled={isBusy}
          onPress={() => onToggleSelect(itemId)}
          style={({ pressed }) => [
            styles.checkbox,
            selected && styles.checkboxSelected,
            pressed && styles.pressed,
          ]}
        >
          {selected ? <AppText variant="caption" style={styles.checkmark}>✓</AppText> : null}
        </Pressable>
      ) : null}

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
        <View style={styles.headerRow}>
          <AppText variant="bodyMedium" numberOfLines={2} style={styles.name}>
            {product ? getProductDisplayName(product) : 'Product'}
          </AppText>
        </View>

        {attributes ? (
          <AppText variant="bodySmall" color="textMuted" numberOfLines={2} style={styles.attributes}>
            {attributes}
          </AppText>
        ) : null}

        <View style={styles.actionsRow}>
          {isCustomizable && onEditVariations ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change product options"
              disabled={isBusy}
              onPress={() => onEditVariations(itemId)}
              hitSlop={4}
              style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
            >
              <AppText variant="bodySmall" color="textLink" style={styles.changeLink}>
                Change
              </AppText>
            </Pressable>
          ) : (
            <View />
          )}

          <View style={styles.quantityActions}>
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
                hitSlop={6}
                style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        <AppText variant="bodyMedium" style={styles.price}>
          {formatProductPrice(lineTotal, currency)}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: colors.surfaceWhite,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 11,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.medium,
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
    minWidth: 0,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  attributes: {
    lineHeight: 18,
  },
  changeLink: {
    fontWeight: '600',
  },
  price: {
    alignSelf: 'flex-end',
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  changeButton: {
    paddingVertical: spacing.xs,
  },
  stepper: {
    borderWidth: 0,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: spacing.xs,
  },
  quantityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  removeButtonPressed: {
    backgroundColor: colors.primarySoft,
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.85,
  },
});
