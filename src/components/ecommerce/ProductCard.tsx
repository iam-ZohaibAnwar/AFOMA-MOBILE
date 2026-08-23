import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '../../components/motion';
import { AppBadge } from '../ui/AppBadge';
import { AppText } from '../ui/AppText';
import { colors, radius, shadows, spacing } from '../../design-system';
import type { Product } from '../../services/types/product';
import {
  getProductCompareAtPrice,
  getProductDiscountPercent,
  getProductDisplayName,
  getProductImageUrl,
  getProductPrice,
  getSellerDisplayName,
  isProductOutOfStockForListing,
} from '../../features/products/utils/productDisplay';
import { ProductPrice } from './ProductPrice';
import { Rating } from './Rating';
import { WishlistButton } from './WishlistButton';

type ProductCardVariant = 'default' | 'elevated';
type ProductCardLayout = 'default' | 'marketplace';

const MARKETPLACE_NAME_LINE_HEIGHT = 18;
const MARKETPLACE_NAME_LINES = 2;
const MARKETPLACE_SELLER_LINE_HEIGHT = 16;

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  variant?: ProductCardVariant;
  layout?: ProductCardLayout;
  showSeller?: boolean;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistPress?: (product: Product) => void;
  badgeLabel?: string;
  showRating?: boolean;
  rating?: number;
  reviewCount?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({
  product,
  onPress,
  variant = 'default',
  layout = 'default',
  showSeller = false,
  showWishlist = false,
  isWishlisted = false,
  onWishlistPress,
  badgeLabel,
  showRating = false,
  rating,
  reviewCount,
  style,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(product);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const isElevated = variant === 'elevated';
  const isMarketplace = layout === 'marketplace';
  const outOfStock = isProductOutOfStockForListing(product);
  const sellerName = getSellerDisplayName(product);
  const resolvedBadge = badgeLabel ?? (outOfStock ? 'Out of stock' : undefined);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`View ${getProductDisplayName(product)}`}
      onPress={() => onPress(product)}
      style={[
        styles.card,
        isElevated && styles.cardElevated,
        isMarketplace && styles.cardMarketplace,
        style,
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          isElevated && styles.imageWrapElevated,
          isMarketplace && styles.imageWrapMarketplace,
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppText variant="caption" color="textMuted">
              No image
            </AppText>
          </View>
        )}

        {resolvedBadge ? (
          <View style={styles.badgeWrap}>
            <AppBadge
              label={resolvedBadge}
              variant={outOfStock ? 'neutral' : 'success'}
            />
          </View>
        ) : null}

        {showWishlist && onWishlistPress ? (
          <View style={styles.wishlistWrap}>
            <WishlistButton
              isActive={isWishlisted}
              onPress={() => onWishlistPress(product)}
              size="sm"
            />
          </View>
        ) : null}
      </View>

      <View style={[styles.content, isMarketplace && styles.contentMarketplace]}>
        <AppText
          variant="label"
          numberOfLines={MARKETPLACE_NAME_LINES}
          style={[
            styles.name,
            isElevated && styles.nameElevated,
            isMarketplace && styles.nameMarketplace,
          ]}
        >
          {getProductDisplayName(product)}
        </AppText>

        {isMarketplace && showSeller ? (
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={styles.sellerMarketplace}
          >
            {sellerName ?? ' '}
          </AppText>
        ) : null}

        <ProductPrice
          price={getProductPrice(product)}
          compareAtPrice={getProductCompareAtPrice(product)}
          discountPercent={getProductDiscountPercent(product)}
          size={isElevated || isMarketplace ? 'md' : 'sm'}
          layout={isMarketplace ? 'marketplace' : 'inline'}
        />

        {showRating && typeof rating === 'number' && rating > 0 ? (
          <Rating value={rating} size="sm" reviewCount={reviewCount} />
        ) : null}

        {!isMarketplace && showSeller && sellerName ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.seller}>
            {sellerName}
          </AppText>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardElevated: {
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  cardMarketplace: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  imageWrapElevated: {
    aspectRatio: 1,
    borderRadius: radius.xl,
  },
  imageWrapMarketplace: {
    aspectRatio: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  badgeWrap: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  wishlistWrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  contentMarketplace: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    alignItems: 'stretch',
  },
  name: {
    minHeight: 36,
  },
  nameElevated: {
    minHeight: 34,
  },
  nameMarketplace: {
    minHeight: MARKETPLACE_NAME_LINE_HEIGHT * MARKETPLACE_NAME_LINES,
    textAlign: 'left',
    fontWeight: '700',
    lineHeight: MARKETPLACE_NAME_LINE_HEIGHT,
    color: colors.textPrimary,
  },
  seller: {
    textDecorationLine: 'underline',
  },
  sellerMarketplace: {
    minHeight: MARKETPLACE_SELLER_LINE_HEIGHT,
    textAlign: 'left',
    lineHeight: MARKETPLACE_SELLER_LINE_HEIGHT,
  },
});
