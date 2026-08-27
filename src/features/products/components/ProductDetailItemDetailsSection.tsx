import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import {
  shouldShowProductDescriptionSection,
  truncateProductDetailPreview,
} from '../utils/productDetailSections';
import { getProductDescription } from '../utils/productDisplay';
import { ProductDetailBottomSheet } from './ProductDetailBottomSheet';
import { ProductDetailDescriptionContent } from './ProductDetailDescriptionContent';

export interface ProductDetailItemDetailsSectionProps {
  description: string;
  theme: PdpTheme;
}

export function ProductDetailItemDetailsSection({
  description,
  theme,
}: ProductDetailItemDetailsSectionProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const normalizedDescription = useMemo(
    () => getProductDescription({ description } as { description?: string }),
    [description],
  );

  const hasContent = shouldShowProductDescriptionSection(description);
  const previewText = useMemo(
    () => truncateProductDetailPreview(normalizedDescription),
    [normalizedDescription],
  );
  const showExpandAction =
    normalizedDescription.trim().length > previewText.replace(/…$/, '').length;

  if (!hasContent) {
    return null;
  }

  return (
    <>
      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
          Item details
        </AppText>

        <AppText
          variant="bodySmall"
          style={[styles.preview, { color: theme.textSecondary }]}
          numberOfLines={4}
        >
          {previewText}
        </AppText>

        {showExpandAction ? (
          <AppButton
            label="See full description"
            variant="primary"
            shape="pill"
            fullWidth
            onPress={() => setSheetVisible(true)}
          />
        ) : null}
      </View>

      <ProductDetailBottomSheet
        visible={sheetVisible}
        title="Description"
        theme={theme}
        onClose={() => setSheetVisible(false)}
      >
        <ProductDetailDescriptionContent description={normalizedDescription} theme={theme} />
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
  title: {
    fontWeight: '700',
  },
  preview: {
    lineHeight: 22,
  },
});
