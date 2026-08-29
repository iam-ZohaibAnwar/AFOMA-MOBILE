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
import type { AdminProductListingCategory } from '../types/adminProductCreate';
import {
  navigateToAdminProductSubtypePicker,
  navigateToAdminProductWizard,
} from '../utils/adminProductCreateNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductType'>;

const RETURN_TO = authReturnTo.adminProductManagement();

export function AdminProductTypeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const sellerId = route.params?.sellerId;
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [category, setCategory] = useState<AdminProductListingCategory | null>(null);

  const handleContinue = () => {
    if (!category) {
      return;
    }

    if (category === 'physical') {
      navigateToAdminProductSubtypePicker(navigation, sellerId);
      return;
    }

    navigateToAdminProductWizard(navigation, 'Downloadable', sellerId);
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
            What are you listing?
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Choose the type of product you want to list.
          </AppText>
        </View>

        <View style={styles.options}>
          <AdminListingOptionCard
            title="Physical product"
            description="Items that require shipping or local pickup."
            selected={category === 'physical'}
            onPress={() => setCategory('physical')}
            icon={<Ionicons name="cube-outline" size={24} color={colors.textInverse} />}
          />

          <AdminListingOptionCard
            title="Digital product"
            description="Files, services, or downloadable content."
            selected={category === 'digital'}
            onPress={() => setCategory('digital')}
            iconBackgroundColor={colors.secondary}
            icon={<Ionicons name="cloud-download-outline" size={24} color={colors.textInverse} />}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <AppButton
          label="Continue →"
          onPress={handleContinue}
          disabled={!category}
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
