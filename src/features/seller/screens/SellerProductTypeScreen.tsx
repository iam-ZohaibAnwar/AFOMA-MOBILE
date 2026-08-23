import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerProductTypeOption } from '../products/components/SellerProductTypeOption';
import type { SellerProductType } from '../products/types/sellerProductType';
import { navigateToIncompleteSellerSetup } from '../products/utils/sellerProductCreationNavigation';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { canSellerCreateProducts } from '../utils/sellerProductGate';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerProductType'>;

const PRODUCT_TYPE_RETURN_TO = authReturnTo.sellerProductType();

const PRODUCT_TYPE_DESTINATIONS: Record<
  SellerProductType,
  keyof Pick<
    SellerStackParamList,
    'SellerStandardProduct' | 'SellerCustomizableProduct' | 'SellerDownloadableProduct'
  >
> = {
  Standard: 'SellerStandardProduct',
  Customizable: 'SellerCustomizableProduct',
  Downloadable: 'SellerDownloadableProduct',
};

export function SellerProductTypeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(PRODUCT_TYPE_RETURN_TO);
  const { profile, isLoading, error, reload } = useSellerProfile(isAuthorized ? sellerId : undefined);

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

  const handleSelectType = (productType: SellerProductType) => {
    navigation.navigate(PRODUCT_TYPE_DESTINATIONS[productType]);
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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <AppText variant="h3" style={styles.introTitle}>
          What are you listing?
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Choose the product type that matches how you sell and deliver your item.
        </AppText>
      </View>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.groupTitle}>
          Physical product
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.groupDescription}>
          Products that require physical delivery.
        </AppText>

        <View style={styles.options}>
          <SellerProductTypeOption
            title="Standard"
            description="A single item with one price and inventory."
            onPress={() => handleSelectType('Standard')}
          />
          <SellerProductTypeOption
            title="Customizable"
            description="Options or attributes such as size, color, or material."
            onPress={() => handleSelectType('Customizable')}
          />
        </View>
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.groupTitle}>
          Digital product
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.groupDescription}>
          Products delivered digitally.
        </AppText>

        <View style={styles.options}>
          <SellerProductTypeOption
            title="Downloadable"
            description="A digital file customers download after purchase."
            onPress={() => handleSelectType('Downloadable')}
          />
        </View>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  intro: {
    gap: spacing.sm,
  },
  introTitle: {
    color: colors.textPrimary,
  },
  groupTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  options: {
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
