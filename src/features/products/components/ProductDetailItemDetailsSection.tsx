import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { Product } from '../../../services/types/product';
import { shouldShowProductDescriptionSection } from '../utils/productDetailSections';
import { formatProductDescriptionForDisplay, getProductDescription } from '../utils/productDisplay';
import { ProductDetailBottomSheet } from './ProductDetailBottomSheet';
import {
  getProductDetailExpandActionTextStyle,
  PRODUCT_DETAIL_SECTION_TITLE_WEIGHT,
  ProductDetailDescriptionContent,
} from './ProductDetailDescriptionContent';

const PREVIEW_LINE_LIMIT = 4;
const EXPAND_CHAR_THRESHOLD = 180;
const PRODUCT_DESCRIPTION_TITLE = 'Product description';

export interface ProductDetailItemDetailsSectionProps {
  product: Product;
  theme: PdpTheme;
}

export function ProductDetailItemDetailsSection({
  product,
  theme,
}: ProductDetailItemDetailsSectionProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const formattedDescription = useMemo(() => getProductDescription(product), [product]);
  const rawDescription = product.description?.trim() ?? '';
  const hasContent = shouldShowProductDescriptionSection(rawDescription);
  const showExpandAction = useMemo(() => {
    if (!hasContent) {
      return false;
    }

    const plain = formatProductDescriptionForDisplay(rawDescription);
    return plain.length > EXPAND_CHAR_THRESHOLD || plain.includes('\n\n');
  }, [hasContent, rawDescription]);

  if (!hasContent) {
    return null;
  }

  return (
    <>
      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <AppText
          variant="h3"
          style={[styles.title, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
        >
          {PRODUCT_DESCRIPTION_TITLE}
        </AppText>

        <ProductDetailDescriptionContent
          description={formattedDescription}
          theme={theme}
          numberOfLines={showExpandAction ? PREVIEW_LINE_LIMIT : undefined}
        />

        {showExpandAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See full description"
            onPress={() => setSheetVisible(true)}
            style={({ pressed }) => [styles.expandAction, pressed && styles.expandActionPressed]}
          >
            <AppText variant="bodyMedium" style={getProductDetailExpandActionTextStyle(theme)}>
              See full description
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ProductDetailBottomSheet
        visible={sheetVisible}
        title={PRODUCT_DESCRIPTION_TITLE}
        theme={theme}
        onClose={() => setSheetVisible(false)}
      >
        <ProductDetailDescriptionContent description={formattedDescription} theme={theme} />
      </ProductDetailBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {},
  expandAction: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  expandActionPressed: {
    opacity: 0.88,
  },
});
