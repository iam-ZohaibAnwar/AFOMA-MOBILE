import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { navigateToShop } from '../../../../../app/navigation/shoppingNavigation';
import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import type { Product } from '../../../../../services/types/product';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../../../auth/utils/resolveAuthUserId';
import { ProductSellerSection } from '../../../../products/components/ProductSellerSection';
import {
  canShowProductSellerMessage,
  resolveSellerChatReceiverId,
} from '../../../../products/utils/productSellerChat';
import type { AdminStackParamList } from '../../../navigation/adminTypes';
import { getAdminProductSellerName } from '../../utils/adminProductDisplay';
import { AdminProductCollapsibleSection } from './AdminProductCollapsibleSection';

export function AdminProductDetailSellerCard({ product }: { product: Product }) {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const seller = product.seller;
  const sellerName = seller?.storeTitle?.trim() || getAdminProductSellerName(product);
  const sellerStoreSlug = seller?.storeSlug?.trim();
  const sellerLogo = seller?.storeLogo?.trim() || seller?.userProfile?.trim();
  const authUserId = resolveAuthUserId(user);
  const canContactSeller = canShowProductSellerMessage({ seller, authUserId });

  const handleVisitShop = () => {
    if (!sellerStoreSlug) {
      return;
    }

    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      navigateToShop(rootNavigation, sellerStoreSlug);
    }
  };

  const handleContactSeller = () => {
    const receiverId = resolveSellerChatReceiverId(seller);
    if (!receiverId) {
      Alert.alert('Unable to contact seller', 'Seller contact is not available for this product.');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Sign in to message this seller.');
      return;
    }

    navigation.getParent()?.navigate('Shopping', {
      screen: 'ChatThread',
      params: { receiverId },
    });
  };

  return (
    <AdminProductCollapsibleSection
      title="Seller Details"
      icon="storefront-outline"
      collapsedPreview={
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.previewText}>
          {sellerName}
        </AppText>
      }
    >
      <ProductSellerSection
        embedded
        centered
        sellerName={sellerName}
        sellerLogoUrl={sellerLogo}
      />

      <View style={styles.actions}>
        <AppButton
          label="Visit shop"
          variant="outline"
          onPress={handleVisitShop}
          disabled={!sellerStoreSlug}
          fullWidth
        />
        <AppButton
          label="Contact seller"
          variant="outline"
          onPress={handleContactSeller}
          disabled={!canContactSeller}
          fullWidth
        />
      </View>
    </AdminProductCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  previewText: {
    textAlign: 'right',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
