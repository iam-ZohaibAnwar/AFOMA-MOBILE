import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { Seller } from '../../../services/types/seller';
import {
  getSellerAvatarUrl,
  getSellerBannerUrl,
  getSellerInitials,
  getSellerStoreTitle,
} from '../utils/sellerDisplay';

export interface ShopHeroProps {
  seller: Seller;
  productCount?: number;
  averageRating?: number;
  reviewCount?: number;
  onBack?: () => void;
}

export function ShopHero({
  seller,
  productCount = 0,
  averageRating,
  reviewCount = 0,
  onBack,
}: ShopHeroProps) {
  const insets = useSafeAreaInsets();
  const bannerUrl = getSellerBannerUrl(seller);
  const avatarUrl = getSellerAvatarUrl(seller);
  const title = getSellerStoreTitle(seller);
  const hasReviews = Boolean(averageRating && reviewCount > 0);
  const showVerified = Boolean(seller._id);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        {onBack ? (
          <HeaderBackButton onPress={onBack} color={colors.textPrimary} />
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}

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
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <AppText variant="h3" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>
          {showVerified ? (
            <View style={styles.verifiedBadge} accessibilityLabel="Verified seller">
              <AppText variant="caption" style={styles.verifiedGlyph}>
                ✓
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          {hasReviews ? (
            <AppText variant="bodySmall" color="textSecondary">
              <Text style={styles.starGlyph}>★ </Text>
              {averageRating?.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
            </AppText>
          ) : (
            <AppText variant="bodySmall" color="textMuted">
              No reviews yet
            </AppText>
          )}

          <AppText variant="bodySmall" color="textMuted" style={styles.statDot}>
            ·
          </AppText>

          <AppText variant="bodySmall" color="textSecondary">
            {productCount} product{productCount === 1 ? '' : 's'}
          </AppText>
        </View>

        {seller.storeDesc ? (
          <AppText variant="bodySmall" color="textSecondary" style={styles.description}>
            {seller.storeDesc}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backPlaceholder: {
    width: 44,
    height: 44,
  },
  bannerWrap: {
    height: 168,
    backgroundColor: colors.primarySoft,
    marginBottom: AVATAR_SIZE / 2 + spacing.sm,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  avatarWrap: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -(AVATAR_SIZE / 2),
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: colors.background,
    overflow: 'hidden',
    backgroundColor: colors.surfaceWhite,
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
  info: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginTop: 2,
  },
  verifiedGlyph: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDot: {
    marginHorizontal: spacing.xs,
  },
  starGlyph: {
    color: colors.warning,
    fontWeight: '700',
  },
  description: {
    lineHeight: 20,
    paddingTop: spacing.xs,
  },
});
