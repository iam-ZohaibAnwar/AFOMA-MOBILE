import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BottomSheet } from '../../../components/ui/BottomSheet';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { usePdpTheme } from '../../../design-system/pdpTheme';
import type { CartLineItem } from '../../../services/types/cart';
import { ProductVariationSelectors } from '../../products/components/ProductVariationSelectors';
import {
  areAllAttributesSelected,
  buildSelectedVariationsForCart,
  getUniqueAttributeValues,
  getVariationAttributeNames,
  isVariationOptionAvailable,
  type SelectedAttributes,
} from '../../products/utils/productVariations';
import { getProductDisplayName } from '../../products/utils/productDisplay';
import { selectedVariationsToAttributes } from '../utils/cartUtils';

export interface CartVariationSheetProps {
  visible: boolean;
  itemId?: string | null;
  line: CartLineItem | null;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (selectedAttributes: SelectedAttributes) => void;
}

export function CartVariationSheet({
  visible,
  itemId = null,
  line,
  isSaving = false,
  errorMessage,
  onClose,
  onSave,
}: CartVariationSheetProps) {
  const theme = usePdpTheme();
  const product = line?.productData;
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>({});
  const initializedItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visible) {
      initializedItemIdRef.current = null;
      return;
    }

    if (!itemId || !line) {
      return;
    }

    if (initializedItemIdRef.current === itemId) {
      return;
    }

    initializedItemIdRef.current = itemId;
    setSelectedAttributes(selectedVariationsToAttributes(line.selectedVariations));
  }, [itemId, line, visible]);

  const attributeNames = useMemo(
    () => getVariationAttributeNames(product?.variations),
    [product?.variations],
  );

  const attributeOptions = useMemo(() => {
    if (!product?.variations?.length) {
      return {} as Record<string, string[]>;
    }

    return attributeNames.reduce<Record<string, string[]>>((acc, attributeName) => {
      acc[attributeName] = getUniqueAttributeValues(product.variations!, attributeName);
      return acc;
    }, {});
  }, [attributeNames, product?.variations]);

  const canSave =
    Boolean(product) &&
    areAllAttributesSelected(product?.variations, selectedAttributes) &&
    !isSaving;

  const handleSave = () => {
    if (!product?.variations?.length) {
      return;
    }

    onSave(selectedAttributes);
  };

  const header = (
    <View>
      <AppText variant="h3" style={styles.title}>
        Change options
      </AppText>
      {product ? (
        <AppText variant="bodySmall" color="textMuted" style={styles.subtitle}>
          {getProductDisplayName(product)}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={header}
      chromeHeight={148}
      maxHeightRatio={0.72}
      footer={
        <View style={styles.actions}>
          <AppButton label="Cancel" variant="outline" onPress={onClose} disabled={isSaving} />
          <AppButton
            label={isSaving ? 'Saving...' : 'Update options'}
            onPress={handleSave}
            disabled={!canSave}
          />
        </View>
      }
    >
      {product ? (
        <ProductVariationSelectors
          attributeNames={attributeNames}
          attributeOptions={attributeOptions}
          selectedAttributes={selectedAttributes}
          onSelectAttribute={(attributeName, value) =>
            setSelectedAttributes((current) => ({
              ...current,
              [attributeName]: value,
            }))
          }
          isOptionAvailable={(attributeName, optionValue) =>
            isVariationOptionAvailable(
              product.variations,
              attributeName,
              optionValue,
              selectedAttributes,
            )
          }
          theme={theme}
        />
      ) : null}

      {errorMessage ? (
        <AppText variant="bodySmall" color="error" style={styles.error}>
          {errorMessage}
        </AppText>
      ) : null}

      {isSaving ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </BottomSheet>
  );
}

export function buildCartVariationSelections(
  product: CartLineItem['productData'],
  selectedAttributes: SelectedAttributes,
) {
  return buildSelectedVariationsForCart(product?.variations, selectedAttributes);
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  error: {
    marginTop: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 237, 0.65)',
  },
});
