import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerProfile } from '../../types/sellerProfile';
import {
  getSellerShopDisplayName,
  isSellerShopVisible,
  resolveSellerShopVisibilityMeta,
} from '../utils/shopVisibilityDisplay';
import { SellerSettingsOptionCard } from './SellerSettingsOptionCard';

export interface SellerShopVisibilityCardProps {
  profile?: SellerProfile | null;
  isUpdating?: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export function SellerShopVisibilityCard({
  profile,
  isUpdating = false,
  onVisibilityChange,
}: SellerShopVisibilityCardProps) {
  const isVisible = isSellerShopVisible(profile);
  const shopName = getSellerShopDisplayName(profile);
  const meta = resolveSellerShopVisibilityMeta(profile);

  return (
    <SellerSettingsOptionCard
      title="Shop visibility"
      description={`Control whether ${shopName} appears in the marketplace.`}
      icon="storefront-outline"
      accentColor={colors.primary}
      meta={meta}
      trailing={
        <View style={styles.switchWrap}>
          {isUpdating ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          <Switch
            value={isVisible}
            onValueChange={onVisibilityChange}
            disabled={isUpdating}
            trackColor={{ false: colors.borderStrong, true: colors.primarySoft }}
            thumbColor={isVisible ? colors.primary : colors.surface}
          />
        </View>
      }
      footer={
        <AppText variant="caption" color="textMuted">
          When hidden, your shop and products are not shown to buyers.
        </AppText>
      }
    />
  );
}

const styles = StyleSheet.create({
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
