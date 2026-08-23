import { Linking, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../../components/ui/AppBadge';
import { AppButton } from '../../../../../components/ui/AppButton';
import { AppCard } from '../../../../../components/ui/AppCard';
import { AppText } from '../../../../../components/ui/AppText';
import type { Product } from '../../../../../services/types/product';
import { colors, spacing } from '../../../../../design-system';
import {
  approvalBadgeVariant,
  formatAdminProductApprovalStatus,
  formatAdminProductInventoryStatus,
  inventoryBadgeVariant,
} from '../../utils/adminProductDisplay';
import { getAdminProductPreviewUrl } from '../../utils/adminProductDetailDisplay';

export interface AdminProductDetailHeaderProps {
  product: Product;
  isRefreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditPress?: () => void;
  onEditVariationsPress?: () => void;
}

export function AdminProductDetailHeader({
  product,
  isRefreshing,
  error,
  onRetry,
  onEditPress,
  onEditVariationsPress,
}: AdminProductDetailHeaderProps) {
  const approvalLabel = formatAdminProductApprovalStatus(product.productStatus);
  const visibilityLabel = formatAdminProductInventoryStatus(product.status);
  const previewUrl = getAdminProductPreviewUrl(product.slug);

  const handlePreviewPress = () => {
    if (!previewUrl) {
      return;
    }

    void Linking.openURL(previewUrl);
  };

  return (
    <AppCard style={styles.card}>
      <AppText variant="h3" style={styles.productName}>
        {product.productName?.trim() || 'Untitled product'}
      </AppText>

      <View style={styles.badgeRow}>
        <AppBadge label={approvalLabel} variant={approvalBadgeVariant(product.productStatus)} />
        <AppBadge label={visibilityLabel} variant={inventoryBadgeVariant(product.status)} />
      </View>

      {product.productType ? (
        <AppText variant="bodySmall" color="textSecondary">
          {product.productType}
        </AppText>
      ) : null}

      <View style={styles.actionRow}>
        {onEditPress ? (
          <AppButton label="Edit product" variant="primary" onPress={onEditPress} />
        ) : null}
        {onEditVariationsPress ? (
          <AppButton label="Edit variations" variant="outline" onPress={onEditVariationsPress} />
        ) : null}
        {previewUrl ? (
          <AppButton label="Preview listing" variant="outline" onPress={handlePreviewPress} />
        ) : null}
      </View>

      {isRefreshing ? (
        <AppText variant="caption" color="textSecondary">
          Refreshing product details...
        </AppText>
      ) : null}

      {error && onRetry ? (
        <AppButton label="Retry loading product" variant="outline" onPress={onRetry} />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  productName: {
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
