import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { AdminListingOptionCard } from '../../admin/product-management/components/AdminListingOptionCard';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { navigateToIncompleteSellerSetup } from '../products/utils/sellerProductCreationNavigation';
import { navigateToSellerProductWizard } from '../products/utils/sellerProductCreateNavigation';
import type { SellerProductType } from '../products/types/sellerProductType';
import { canSellerCreateProducts } from '../utils/sellerProductGate';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerProductSubtype'>;

const PRODUCT_TYPE_RETURN_TO = authReturnTo.sellerProductType();

type PhysicalProductType = Extract<SellerProductType, 'Standard' | 'Customizable'>;

export function SellerProductSubtypeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(PRODUCT_TYPE_RETURN_TO);
  const { profile, isLoading, error, reload } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const [productType, setProductType] = useState<PhysicalProductType | null>(null);

  const canCreate = canSellerCreateProducts(profile?.profileSetup);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthorized || isLoading || !profile) {
        return;
      }

      if (!canCreate) {
        navigateToIncompleteSellerSetup(navigation, profile);
      }
    }, [canCreate, isAuthorized, isLoading, navigation, profile]),
  );

  const handleContinue = () => {
    if (!productType) {
      return;
    }

    navigateToSellerProductWizard(navigation, productType);
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !profile) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  if (!canCreate) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.intro}>
          <AppText variant="h2" style={styles.introTitle}>
            Choose product format
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Physical products can be a single listing or a product with variations.
          </AppText>
        </View>

        <View style={styles.options}>
          <AdminListingOptionCard
            title="Standard"
            description="A single item with one price and inventory."
            selected={productType === 'Standard'}
            onPress={() => setProductType('Standard')}
            icon={<Ionicons name="pricetag-outline" size={24} color={colors.textInverse} />}
          />

          <AdminListingOptionCard
            title="Customizable"
            description="Variations such as size, colour, or material."
            selected={productType === 'Customizable'}
            onPress={() => setProductType('Customizable')}
            icon={<Ionicons name="options-outline" size={24} color={colors.textInverse} />}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <AppButton label="Continue →" onPress={handleContinue} disabled={!productType} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  intro: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  introTitle: {
    color: colors.textPrimary,
  },
  options: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
});
