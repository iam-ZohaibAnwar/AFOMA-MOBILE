import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import type { Product } from '../../../../../services/types/product';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../../../auth/utils/resolveAuthUserId';
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
  const sellerId = seller?._id ?? seller?.id ?? seller?.userId;
  const sellerLogo = seller?.storeLogo?.trim() || seller?.userProfile?.trim();
  const authUserId = resolveAuthUserId(user);
  const canContactSeller = canShowProductSellerMessage({ seller, authUserId });

  const handleOpenSellerDetail = () => {
    if (!sellerId) {
      return;
    }

    navigation.navigate('AdminSellerDetail', {
      sellerId: String(sellerId),
    });
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
      <Pressable
        accessibilityRole="button"
        disabled={!sellerId}
        onPress={handleOpenSellerDetail}
        style={({ pressed }) => [styles.profileRow, pressed && sellerId && styles.profileRowPressed]}
      >
        <View style={styles.avatarWrap}>
          {sellerLogo ? (
            <Image source={{ uri: sellerLogo }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={20} color={colors.textInverse} />
            </View>
          )}
        </View>

        <View style={styles.profileCopy}>
          <AppText variant="bodyMedium" style={styles.sellerName} numberOfLines={1}>
            {sellerName}
          </AppText>
          {seller?.uuid ? (
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {String(seller.uuid)}
            </AppText>
          ) : null}
        </View>

        {sellerId ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null}
      </Pressable>

      <AppButton
        label="Contact seller"
        variant="outline"
        onPress={handleContactSeller}
        disabled={!canContactSeller}
        fullWidth
      />
    </AdminProductCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  previewText: {
    textAlign: 'right',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileRowPressed: {
    opacity: 0.9,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sellerName: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
