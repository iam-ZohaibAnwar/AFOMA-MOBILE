import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerShippingConfigEditor } from '../components/SellerShippingConfigEditor';
import { useSellerShippingConfig } from '../hooks/useSellerShippingConfig';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerShippingConfig'>;

const SHIPPING_RETURN_TO = authReturnTo.sellerShippingConfig();

export function SellerShippingConfigScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(SHIPPING_RETURN_TO);
  const shipping = useSellerShippingConfig(isAuthorized ? sellerId : undefined, {
    includeProfileSetup: true,
  });

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (shipping.error && shipping.hasLoaded && !shipping.profile) {
    return (
      <View style={styles.centeredState}>
        <ErrorState message={shipping.error} onAction={() => void shipping.reload()} />
      </View>
    );
  }

  if (!shipping.hasLoaded) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading shipping configuration...
        </AppText>
      </View>
    );
  }

  return (
    <SellerShippingConfigEditor
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
