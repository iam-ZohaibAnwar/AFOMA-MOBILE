import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../../admin/product-management/components/AdminProductStatusChip';
import { getProductDisplayName, getProductImageUrl } from '../../../products/utils/productDisplay';
import type { Product } from '../../../../services/types/product';
import {
  formatSellerListPrice,
  getSellerProductSubtitle,
  isSellerProductDimmed,
  resolveSellerProductAccentColor,
  resolveSellerProductListStatusChips,
} from '../utils/sellerProductListDisplay';

export interface SellerProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onMenuPress: (product: Product) => void;
  isBusy?: boolean;
}

export function SellerProductCard({
  product,
  onPress,
  onMenuPress,
  isBusy = false,
}: SellerProductCardProps) {
  const productId = product._id;
  const dimmed = isSellerProductDimmed(product);
  const imageUrl = getProductImageUrl(product);
  const accentColor = resolveSellerProductAccentColor(product);
  const subtitle = getSellerProductSubtitle(product);
  const statusChips = resolveSellerProductListStatusChips(product);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={!productId || isBusy}
        onPress={() => onPress(product)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={styles.thumbnailWrap}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.thumbnail, dimmed && styles.thumbnailDimmed]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Ionicons name="image-outline" size={24} color={colors.textInverse} />
            </View>
          )}

          {dimmed ? (
            <View style={styles.thumbnailOverlay}>
              <Ionicons name="ban-outline" size={20} color={colors.textInverse} />
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <AppText
            variant="bodyMedium"
            style={[styles.productName, dimmed && styles.productNameDimmed]}
            numberOfLines={1}
          >
            {getProductDisplayName(product) || 'Untitled product'}
          </AppText>

          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>

          <View style={styles.footerRow}>
            <AppText variant="bodyMedium" style={[styles.price, dimmed && styles.priceDimmed]}>
              {formatSellerListPrice(product)}
            </AppText>

            {statusChips.length > 0 ? (
              <View style={styles.chipsRow}>
                {statusChips.map((chip) => (
                  <AdminProductStatusChip
                    key={chip.id}
                    label={chip.label}
                    icon={chip.icon as keyof typeof Ionicons.glyphMap}
                    tone={chip.tone}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Product actions"
        disabled={!productId || isBusy}
        onPress={() => onMenuPress(product)}
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

const THUMBNAIL_SIZE = 80;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
    position: 'relative',
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
    minHeight: THUMBNAIL_SIZE + spacing.md * 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  thumbnailWrap: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailDimmed: {
    opacity: 0.4,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.4)',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    gap: 2,
  },
  productName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    paddingRight: spacing.xs,
  },
  productNameDimmed: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  subtitle: {
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 17,
    flexShrink: 0,
  },
  priceDimmed: {
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
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
    opacity: 0.7,
  },
});
