import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { SellerShippingConfigEditor } from '../../../seller/shipping/components/SellerShippingConfigEditor';
import { useSellerShippingConfig } from '../../../seller/shipping/hooks/useSellerShippingConfig';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { getAdminSellerDisplayName } from '../../seller-management/utils/adminSellerDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsSellerShippingEdit'>;

export function AdminSettingsSellerShippingEditScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSettingsSellerShippingEdit(sellerId);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const shipping = useSellerShippingConfig(isAuthorized ? sellerId : undefined, {
    includeProfileSetup: false,
  });

  if (!isAuthorized) {
    return <View style={[styles.centeredState, { paddingTop: insets.top }]} />;
  }

  if (shipping.isLoading && !shipping.profile) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading shipping configuration...
        </AppText>
      </View>
    );
  }

  if (shipping.error && !shipping.profile) {
    return (
      <View style={styles.centeredState}>
        <ErrorState message={shipping.error} onAction={() => void shipping.reload()} />
      </View>
    );
  }

  const sellerName = shipping.profile
    ? getAdminSellerDisplayName({
        firstName: shipping.profile.firstName,
        lastName: shipping.profile.lastName,
        storeTitle: shipping.profile.storeTitle,
      })
    : initialSeller
      ? getAdminSellerDisplayName(initialSeller)
      : 'Seller';

  return (
    <SellerShippingConfigEditor
      title={`${sellerName} shipping`}
      profile={shipping.profile}
      form={shipping.form}
      isSaving={shipping.isSaving}
      saveError={shipping.saveError}
      saveSuccessMessage={shipping.saveSuccessMessage}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
      onUpdateForm={shipping.updateForm}
      onChangeCurrency={shipping.changeCurrency}
      onSave={shipping.save}
      onClearSaveError={() => shipping.setSaveError(null)}
    />
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
    padding: spacing.lg,
  },
});
