import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';
import { PRODUCT_DETAIL_SECTION_TITLE_WEIGHT } from './ProductDetailDescriptionContent';
import { ProductDetailPolicyContent } from './ProductDetailPolicyContent';

export interface ProductDetailPoliciesSectionProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

export function ProductDetailPoliciesSection({ policy, theme }: ProductDetailPoliciesSectionProps) {
  const cancellationMessage = getCancellationPolicyMessage(policy);
  const returnMessage = getReturnPolicyMessage(policy);
  const faqs = (policy.faqList ?? []).filter((faq) => faq.question?.trim());

  if (!cancellationMessage && !returnMessage && faqs.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, { borderTopColor: theme.border }]}>
      <AppText
        variant="h3"
        style={[styles.title, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
      >
        Shipping & policies
      </AppText>

      <ProductDetailPolicyContent policy={policy} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {},
});
