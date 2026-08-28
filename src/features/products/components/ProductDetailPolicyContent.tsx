import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import {
  formatProductDescriptionForDisplay,
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';
import {
  getProductDetailBodyTextStyle,
  PRODUCT_DETAIL_SECTION_TITLE_WEIGHT,
} from './ProductDetailDescriptionContent';

export interface ProductDetailPolicyContentProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

function PolicyParagraph({ text, theme }: { text: string; theme: PdpTheme }) {
  const bodyStyle = getProductDetailBodyTextStyle(theme);
  const paragraphs = formatProductDescriptionForDisplay(text).split(/\n\n+/).filter(Boolean);

  if (paragraphs.length === 0) {
    return (
      <AppText variant="body" style={bodyStyle}>
        {text.trim()}
      </AppText>
    );
  }

  return (
    <View style={styles.paragraphGroup}>
      {paragraphs.map((paragraph, index) => (
        <AppText key={`policy-paragraph-${index}`} variant="body" style={bodyStyle}>
          {paragraph}
        </AppText>
      ))}
    </View>
  );
}

export function ProductDetailPolicyContent({ policy, theme }: ProductDetailPolicyContentProps) {
  const cancellationMessage = getCancellationPolicyMessage(policy);
  const returnMessage = getReturnPolicyMessage(policy);
  const faqs = (policy.faqList ?? []).filter((faq) => faq.question?.trim());

  if (!cancellationMessage && !returnMessage && faqs.length === 0) {
    return (
      <AppText variant="body" style={getProductDetailBodyTextStyle(theme)}>
        No policy details available for this shop.
      </AppText>
    );
  }

  return (
    <View style={styles.container}>
      {cancellationMessage ? (
        <View style={styles.policyBlock}>
          <AppText
            variant="bodyMedium"
            style={[styles.policyTitle, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
          >
            Cancellation policy
          </AppText>
          <PolicyParagraph text={cancellationMessage} theme={theme} />
        </View>
      ) : null}

      {returnMessage ? (
        <View style={styles.policyBlock}>
          <AppText
            variant="bodyMedium"
            style={[styles.policyTitle, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
          >
            Return policy
          </AppText>
          <PolicyParagraph text={returnMessage} theme={theme} />
        </View>
      ) : null}

      {faqs.length > 0 ? (
        <View style={styles.policyBlock}>
          <AppText
            variant="bodyMedium"
            style={[styles.policyTitle, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
          >
            FAQs
          </AppText>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <View key={`faq-${index}`} style={styles.faqItem}>
                <AppText variant="bodyMedium" style={[styles.faqQuestion, { color: theme.textPrimary }]}>
                  {faq.question?.trim()}
                </AppText>
                {faq.answer?.trim() ? <PolicyParagraph text={faq.answer} theme={theme} /> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  policyBlock: {
    gap: spacing.xs,
  },
  policyTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  paragraphGroup: {
    gap: spacing.sm,
  },
  faqList: {
    gap: spacing.md,
  },
  faqItem: {
    gap: spacing.xs,
  },
  faqQuestion: {
    fontWeight: '600',
    lineHeight: 22,
  },
});
