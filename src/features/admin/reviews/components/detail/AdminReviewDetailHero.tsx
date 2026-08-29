import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../product-management/components/AdminProductStatusChip';
import type { AdminReviewListItem, AdminReviewListTabId } from '../../types/adminReviews';
import {
  formatAdminReviewStatus,
  getAdminReviewCustomerName,
  getAdminReviewTitle,
} from '../../utils/adminReviewsContent';
import { getAdminReviewCustomerEmail } from '../../utils/adminReviewsDisplay';
import {
  getAdminReviewListProductLabel,
  resolveAdminReviewListIcon,
  resolveAdminReviewListStatusChips,
} from '../../utils/adminReviewListDisplay';

export interface AdminReviewDetailHeroProps {
  review: AdminReviewListItem;
  listTab?: AdminReviewListTabId;
}

export function AdminReviewDetailHero({ review, listTab = 'customer' }: AdminReviewDetailHeroProps) {
  const statusChips = resolveAdminReviewListStatusChips(review);
  const customerEmail = getAdminReviewCustomerEmail(review);

  return (
    <View style={styles.hero}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
        <Ionicons name={resolveAdminReviewListIcon(listTab)} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="h3" style={styles.customerName}>
          {getAdminReviewCustomerName(review)}
        </AppText>

        {customerEmail ? (
          <AppText variant="bodySmall" color="textSecondary">
            {customerEmail}
          </AppText>
        ) : null}

        <AppText variant="bodySmall" color="textSecondary">
          {getAdminReviewListProductLabel(review, listTab)}
        </AppText>

        <AppText variant="bodyMedium" style={styles.title}>
          {getAdminReviewTitle(review)}
        </AppText>

        <AppText variant="caption" color="textMuted">
          Status: {formatAdminReviewStatus(review.reviewStatus)}
        </AppText>

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
