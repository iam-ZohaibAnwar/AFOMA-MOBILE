import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppBadge } from '../../../../../components/ui/AppBadge';
import { AppButton } from '../../../../../components/ui/AppButton';
import { AppCard } from '../../../../../components/ui/AppCard';
import { AppText } from '../../../../../components/ui/AppText';
import type { Product } from '../../../../../services/types/product';
import { colors, spacing } from '../../../../../design-system';
import type { AdminStackParamList } from '../../../navigation/adminTypes';
import {
  approvalBadgeVariant,
  formatAdminProductApprovalStatus,
  formatAdminProductInventoryStatus,
  inventoryBadgeVariant,
} from '../../utils/adminProductDisplay';
import {
  canAdminPreviewProductInApp,
  navigateToAdminProductMobilePreview,
} from '../../utils/adminProductPreviewNavigation';

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
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const approvalLabel = formatAdminProductApprovalStatus(product.productStatus);
  const visibilityLabel = formatAdminProductInventoryStatus(product.status);
  const canPreview = canAdminPreviewProductInApp(product);

  const handlePreviewPress = () => {
    if (!navigateToAdminProductMobilePreview(navigation, product)) {
      Alert.alert('Preview unavailable', 'This product cannot be opened in the mobile storefront yet.');
    }
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
        {canPreview ? (
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
