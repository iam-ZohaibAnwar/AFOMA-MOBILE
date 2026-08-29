import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';
import { PRODUCT_DETAIL_SECTION_TITLE_WEIGHT } from './ProductDetailDescriptionContent';
import { ProductDetailBottomSheet } from './ProductDetailBottomSheet';
import { ProductDetailFaqContent, ProductDetailPolicyContent } from './ProductDetailPolicyContent';

const FAQ_SHEET_TITLE = 'FAQs';

export interface ProductDetailPoliciesSectionProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

export function ProductDetailPoliciesSection({ policy, theme }: ProductDetailPoliciesSectionProps) {
  const [faqSheetVisible, setFaqSheetVisible] = useState(false);
  const cancellationMessage = getCancellationPolicyMessage(policy);
  const returnMessage = getReturnPolicyMessage(policy);
  const faqs = useMemo(
    () => (policy.faqList ?? []).filter((faq) => faq.question?.trim()),
    [policy.faqList],
  );
  const hasPolicyContent = Boolean(cancellationMessage || returnMessage);
  const hasFaqs = faqs.length > 0;

  if (!hasPolicyContent && !hasFaqs) {
    return null;
  }

  return (
    <>
      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <AppText
          variant="h3"
          style={[styles.title, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
        >
          Shipping & policies
        </AppText>

        {hasPolicyContent ? <ProductDetailPolicyContent policy={policy} theme={theme} /> : null}

        {hasFaqs ? (
          <AppButton
            accessibilityLabel="See FAQs"
            label="See FAQs"
            variant="primary"
            shape="pill"
            fullWidth
            onPress={() => setFaqSheetVisible(true)}
            style={styles.faqAction}
          />
        ) : null}
      </View>

      <ProductDetailBottomSheet
        visible={faqSheetVisible}
        title={FAQ_SHEET_TITLE}
        theme={theme}
        onClose={() => setFaqSheetVisible(false)}
      >
        <ProductDetailFaqContent faqs={faqs} theme={theme} />
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
  faqAction: {
    marginTop: spacing.xs,
  },
});
