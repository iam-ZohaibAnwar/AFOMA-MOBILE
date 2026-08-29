import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { AdminListingOptionCard } from '../components/AdminListingOptionCard';
import type { AdminProductAiListingType } from '../types/adminProductAiPrefill';
import { navigateToAdminProductWizard } from '../utils/adminProductCreateNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductSubtype'>;

const RETURN_TO = authReturnTo.adminProductManagement();

type PhysicalProductType = Extract<AdminProductAiListingType, 'Standard' | 'Customizable'>;

export function AdminProductSubtypeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const sellerId = route.params?.sellerId;
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [productType, setProductType] = useState<PhysicalProductType | null>(null);

  const handleContinue = () => {
    if (!productType) {
      return;
    }

    navigateToAdminProductWizard(navigation, productType, sellerId);
  };

  if (!isAuthorized) {
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
        <AppButton
          label="Continue →"
          onPress={handleContinue}
          disabled={!productType}
          fullWidth
        />
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
