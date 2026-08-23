import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { Rating } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';
import type { Seller } from '../../../services/types/seller';
import {
  getSellerAvatarUrl,
  getSellerBannerUrl,
  getSellerInitials,
  getSellerLocationLabel,
  getSellerStoreTitle,
} from '../utils/sellerDisplay';

export interface ShopHeroProps {
  seller: Seller;
  productCount?: number;
  averageRating?: number;
  reviewCount?: number;
}

export function ShopHero({ seller, productCount, averageRating, reviewCount }: ShopHeroProps) {
  const bannerUrl = getSellerBannerUrl(seller);
  const avatarUrl = getSellerAvatarUrl(seller);
  const title = getSellerStoreTitle(seller);
  const location = getSellerLocationLabel(seller);

  return (
    <View style={styles.container}>
      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText variant="label" color="primary">
                {getSellerInitials(seller)}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <AppText variant="h3" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>
          {location ? (
            <AppText variant="bodySmall" color="textMuted" numberOfLines={1}>
              {location}
            </AppText>
          ) : null}
        </View>
      </View>

      {seller.storeDesc ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.description} numberOfLines={3}>
          {seller.storeDesc}
        </AppText>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <AppText variant="label" style={styles.statValue}>
            {productCount ?? 0}
          </AppText>
          <AppText variant="caption" color="textMuted">
            Products
          </AppText>
        </View>

        <View style={styles.statCard}>
          {averageRating && reviewCount ? (
            <>
              <View style={styles.ratingRow}>
                <AppText variant="label" style={styles.statValue}>
                  {averageRating.toFixed(1)}
                </AppText>
                <Rating value={averageRating} size="sm" />
              </View>
              <AppText variant="caption" color="textMuted">
                {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </AppText>
            </>
          ) : (
            <>
              <AppText variant="label" style={styles.statValue}>
                —
              </AppText>
              <AppText variant="caption" color="textMuted">
                No reviews yet
              </AppText>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.sm,
  },
  bannerWrap: {
    height: 160,
    backgroundColor: colors.primarySoft,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: -28,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.background,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  details: {
    flex: 1,
    gap: 2,
    paddingTop: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  description: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
