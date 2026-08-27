import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import { truncateProductDetailPreview } from '../utils/productDetailSections';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';
import { ProductDetailBottomSheet } from './ProductDetailBottomSheet';
import { ProductDetailPolicyContent } from './ProductDetailPolicyContent';

function buildPolicyPreviewText(policy: ProductStorePolicy): string {
  const parts = [
    getCancellationPolicyMessage(policy),
    getReturnPolicyMessage(policy),
  ].filter(Boolean) as string[];

  return parts.join(' ');
}

export interface ProductDetailPoliciesSectionProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

export function ProductDetailPoliciesSection({ policy, theme }: ProductDetailPoliciesSectionProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const fullPreviewSource = useMemo(() => buildPolicyPreviewText(policy), [policy]);
  const previewText = useMemo(
    () => truncateProductDetailPreview(fullPreviewSource),
    [fullPreviewSource],
  );

  if (!fullPreviewSource.trim()) {
    return null;
  }

  return (
    <>
      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
          Shipping & policies
        </AppText>

        <AppText
          variant="bodySmall"
          style={[styles.preview, { color: theme.textSecondary }]}
          numberOfLines={4}
        >
          {previewText}
        </AppText>

        <AppButton
          label="See full policies"
          variant="primary"
          shape="pill"
          fullWidth
          onPress={() => setSheetVisible(true)}
        />
      </View>

      <ProductDetailBottomSheet
        visible={sheetVisible}
        title="Shipping & policies"
        theme={theme}
        onClose={() => setSheetVisible(false)}
      >
        <ProductDetailPolicyContent policy={policy} theme={theme} />
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
