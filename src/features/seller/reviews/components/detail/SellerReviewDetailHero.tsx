import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerReviewListItem } from '../../types/sellerReview';
import {
  formatSellerReviewDate,
  getSellerReviewCustomerName,
  getSellerReviewProductName,
  getSellerReviewTitle,
} from '../../utils/sellerReviewsDisplay';
import {
  resolveSellerReviewListIcon,
  resolveSellerReviewListStatusChips,
} from '../../utils/sellerReviewListDisplay';

export interface SellerReviewDetailHeroProps {
  review: SellerReviewListItem;
}

export function SellerReviewDetailHero({ review }: SellerReviewDetailHeroProps) {
  const statusChips = resolveSellerReviewListStatusChips(review);
  const reviewDate = formatSellerReviewDate(review);

  return (
    <View style={styles.hero}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
        <Ionicons name={resolveSellerReviewListIcon()} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="h3" style={styles.customerName}>
          {getSellerReviewCustomerName(review)}
        </AppText>

        <AppText variant="bodySmall" color="textSecondary">
          {getSellerReviewProductName(review)}
        </AppText>

        <AppText variant="bodyMedium" style={styles.title}>
          {getSellerReviewTitle(review)}
        </AppText>

        {reviewDate !== '—' ? (
          <AppText variant="caption" color="textMuted">
            {reviewDate}
          </AppText>
        ) : null}

        {statusChips.length > 0 ? (
          <View style={styles.chipsRow}>
            {statusChips.map((chip) => (
              <AdminProductStatusChip
                key={chip.id}
                label={chip.label}
                icon={chip.icon}
                tone={chip.tone}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  customerName: {
    color: colors.textPrimary,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
