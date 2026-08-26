import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
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
  line: CartLineItem | null;
  isSaving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (selectedAttributes: SelectedAttributes) => void;
}

const SHEET_HEIGHT_RATIO = 0.72;
const SHEET_CHROME_HEIGHT = 148;

export function CartVariationSheet({
  visible,
  line,
  isSaving = false,
  errorMessage,
  onClose,
  onSave,
}: CartVariationSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const theme = usePdpTheme();
  const product = line?.productData;
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>({});

  useEffect(() => {
    if (visible && line) {
      setSelectedAttributes(selectedVariationsToAttributes(line.selectedVariations));
    }
  }, [line, visible]);

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

  const sheetHeight = Math.min(windowHeight * SHEET_HEIGHT_RATIO, windowHeight - insets.top - spacing.lg);
  const scrollMaxHeight = Math.max(180, sheetHeight - SHEET_CHROME_HEIGHT - insets.bottom);

  const handleSave = () => {
    if (!product?.variations?.length) {
      return;
    }

    onSave(selectedAttributes);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close options" style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetHeight,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
            shadows.card,
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <AppText variant="h3" style={styles.title}>
            Change options
          </AppText>
          {product ? (
            <AppText variant="bodySmall" color="textMuted" style={styles.subtitle}>
              {getProductDisplayName(product)}
            </AppText>
          ) : null}

          <ScrollView
            style={{ maxHeight: scrollMaxHeight }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Cancel" variant="outline" onPress={onClose} disabled={isSaving} />
            <AppButton
              label={isSaving ? 'Saving...' : 'Update options'}
              onPress={handleSave}
              disabled={!canSave}
            />
          </View>

          {isSaving ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// Validate cart variation payload before save (used by parent).
export function buildCartVariationSelections(
  product: CartLineItem['productData'],
  selectedAttributes: SelectedAttributes,
) {
  return buildSelectedVariationsForCart(product?.variations, selectedAttributes);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  error: {
    marginTop: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 247, 237, 0.65)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
});
