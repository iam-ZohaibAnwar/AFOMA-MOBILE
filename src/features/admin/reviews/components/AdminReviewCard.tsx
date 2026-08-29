import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';
import type { AdminReviewListItem, AdminReviewListTabId } from '../types/adminReviews';
import { getAdminReviewCustomerName, getAdminReviewTitle } from '../utils/adminReviewsContent';
import { getAdminReviewCustomerEmail, getAdminReviewText } from '../utils/adminReviewsDisplay';
import {
  formatAdminReviewRating,
  getAdminReviewListProductLabel,
  resolveAdminReviewAccentColor,
  resolveAdminReviewListIcon,
  resolveAdminReviewListStatusChips,
} from '../utils/adminReviewListDisplay';

export interface AdminReviewCardProps {
  review: AdminReviewListItem;
  listTab: AdminReviewListTabId;
  onPress: (review: AdminReviewListItem) => void;
  onMenuPress: (review: AdminReviewListItem) => void;
  isBusy?: boolean;
}

export function AdminReviewCard({
  review,
  listTab,
  onPress,
  onMenuPress,
  isBusy = false,
}: AdminReviewCardProps) {
  const accentColor = resolveAdminReviewAccentColor(review.reviewStatus);
  const statusChips = resolveAdminReviewListStatusChips(review);
  const customerEmail = getAdminReviewCustomerEmail(review);
  const reviewText = getAdminReviewText(review);
  const truncatedText =
    reviewText.length > 120 ? `${reviewText.slice(0, 120).trim()}…` : reviewText;

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={!review._id || isBusy}
        onPress={() => onPress(review)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <Ionicons name={resolveAdminReviewListIcon(listTab)} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.content}>
          <AppText variant="bodyMedium" style={styles.customerName} numberOfLines={1}>
            {getAdminReviewCustomerName(review)}
          </AppText>

          {customerEmail ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {customerEmail}
            </AppText>
          ) : null}

          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {getAdminReviewListProductLabel(review, listTab)}
          </AppText>

          <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
            {getAdminReviewTitle(review)}
          </AppText>

          <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
            {truncatedText}
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

          <View style={styles.footerRow}>
            <View style={styles.ratingBlock}>
              <AppText variant="caption" color="textMuted" style={styles.ratingLabel}>
                AVG
              </AppText>
              <AppText variant="bodyMedium" style={styles.ratingValue}>
                {formatAdminReviewRating(review.avgRating)}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Review actions"
        disabled={!review._id || isBusy}
        onPress={() => onMenuPress(review)}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        hitSlop={8}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: spacing.md + 28,
    paddingLeft: spacing.md + 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  customerName: {
    color: colors.textPrimary,
    fontWeight: '700',
    paddingRight: spacing.xs,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  ratingBlock: {
    gap: 2,
  },
  ratingLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ratingValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
});
