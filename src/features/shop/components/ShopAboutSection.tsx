import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { Rating } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';
import type { Seller } from '../../../services/types/seller';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../../products/utils/productDisplay';
import {
  getSellerAvatarUrl,
  getSellerInitials,
  getSellerLocationLabel,
  getSellerStoreTitle,
} from '../utils/sellerDisplay';

export interface ShopAboutSectionProps {
  seller: Seller;
}

export function ShopAboutSection({ seller }: ShopAboutSectionProps) {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const avatarUrl = getSellerAvatarUrl(seller);
  const location = getSellerLocationLabel(seller);
  const policy = seller.storePolicy;
  const cancellationMessage = policy ? getCancellationPolicyMessage(policy) : null;
  const returnMessage = policy ? getReturnPolicyMessage(policy) : null;
  const faqList = policy?.faqList?.filter((item) => item.question?.trim()) ?? [];

  return (
    <View style={styles.content}>
      <View style={styles.aboutCard}>
        <View style={styles.sellerRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText variant="label" color="primary">
                {getSellerInitials(seller)}
              </AppText>
            </View>
          )}

          <View style={styles.sellerDetails}>
            <AppText variant="bodyMedium" style={styles.sellerName}>
              {[seller.firstName, seller.lastName].filter(Boolean).join(' ').trim() ||
                getSellerStoreTitle(seller)}
            </AppText>
            {location ? (
              <AppText variant="bodySmall" color="textMuted">
                {location}
              </AppText>
            ) : null}
          </View>
        </View>

        {seller.storeDesc ? (
          <AppText variant="bodySmall" color="textSecondary" style={styles.description}>
            {seller.storeDesc}
          </AppText>
        ) : null}
      </View>

      {cancellationMessage || returnMessage ? (
        <View style={styles.section}>
          <AppText variant="label" style={styles.sectionTitle}>
            Store policies
          </AppText>

          {cancellationMessage ? (
            <View style={styles.policyBlock}>
              <AppText variant="bodyMedium" style={styles.policyTitle}>
                Cancellation
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                {cancellationMessage}
              </AppText>
            </View>
          ) : null}

          {returnMessage ? (
            <View style={styles.policyBlock}>
              <AppText variant="bodyMedium" style={styles.policyTitle}>
                Returns
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                {returnMessage}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      {faqList.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="label" style={styles.sectionTitle}>
            FAQs
          </AppText>
          {faqList.map((item, index) => {
            const expanded = expandedFaqIndex === index;
            return (
              <View key={`${item.question}-${index}`} style={styles.faqItem}>
                <AppText
                  variant="bodyMedium"
                  style={styles.faqQuestion}
                  onPress={() => setExpandedFaqIndex(expanded ? null : index)}
                >
                  {expanded ? '▾ ' : '▸ '}
                  {item.question}
                </AppText>
                {expanded && item.answer ? (
                  <AppText variant="bodySmall" color="textSecondary" style={styles.faqAnswer}>
                    {item.answer}
                  </AppText>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  aboutCard: {
    padding: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing.md,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  sellerDetails: {
    flex: 1,
    gap: 2,
  },
  sellerName: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    lineHeight: 20,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  policyBlock: {
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing.xs,
  },
  policyTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  faqItem: {
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing.xs,
  },
  faqQuestion: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  faqAnswer: {
    lineHeight: 20,
  },
});
