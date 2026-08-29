import { Alert, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminSellerListItem } from '../../types/adminSellerManagement';
import {
  getAdminSellerShopVisibilityLabel,
  isAdminSellerShopVisible,
} from '../../utils/adminSellerDisplay';

export interface AdminSellerDetailOperationsCardProps {
  seller: AdminSellerListItem;
  isUpdatingVisibility: boolean;
  onEnablePress: () => void;
  onDisablePress: () => void;
}

export function AdminSellerDetailOperationsCard({
  seller,
  isUpdatingVisibility,
  onEnablePress,
  onDisablePress,
}: AdminSellerDetailOperationsCardProps) {
  const isVisible = isAdminSellerShopVisible(seller);
  const visibilityLabel = getAdminSellerShopVisibilityLabel(seller);

  const handleVisibilityToggle = (nextValue: boolean) => {
    if (nextValue) {
      onEnablePress();
      return;
    }

    onDisablePress();
  };

  return (
    <AdminProductDetailCardShell title="Seller Operations" icon="shield-outline" accent iconVariant="solid">
      <View style={styles.operationRow}>
        <View style={styles.operationCopy}>
          <AppText variant="bodyMedium" style={styles.operationTitle}>
            Shop visibility
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {isVisible ? 'Visible in search & browse' : 'Hidden from storefront'} ({visibilityLabel})
          </AppText>
        </View>

        <Switch
          value={isVisible}
          onValueChange={handleVisibilityToggle}
          disabled={isUpdatingVisibility}
          trackColor={{ false: colors.borderStrong, true: colors.primarySoft }}
          thumbColor={isVisible ? colors.primary : colors.surface}
        />
      </View>
    </AdminProductDetailCardShell>
  );
}

export function confirmHideSellerShop(
  sellerName: string,
  onConfirm: () => void,
): void {
  Alert.alert(
    'Hide this shop?',
    `${sellerName} will be hidden from buyers until visibility is turned back on.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Hide shop', style: 'destructive', onPress: onConfirm },
    ],
  );
}

const styles = StyleSheet.create({
  operationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  operationCopy: {
    flex: 1,
    gap: 2,
  },
  operationTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
