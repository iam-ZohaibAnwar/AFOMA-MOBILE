import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { AppButton } from '../../../../components/ui/AppButton';

import { AppInput } from '../../../../components/ui/AppInput';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import { useAuth } from '../../../auth/hooks/useAuth';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';

import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { AdminSettingsDetailHero } from '../components/AdminSettingsDetailHero';

import { useAdminCommissionRateEditor } from '../hooks/useAdminCommissionRateEditor';

import { getAdminCommissionRateSettingLabel } from '../utils/adminSettingsContent';

import { formatAdminCommissionRateDisplay } from '../utils/adminSettingsDisplay';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsCommissionRate'>;



const COMMISSION_RATE_ICONS = {

  'affiliate-commission': 'people-outline',

  'seller-referral-commission': 'storefront-outline',

  'buyer-referral-commission': 'cart-outline',

} as const;



export function AdminSettingsCommissionRateScreen({ route }: Props) {

  const insets = useSafeAreaInsets();

  const { rateType } = route.params;

  const returnTo = authReturnTo.adminSettingsCommissionRate(rateType);

  const { isAuthorized } = useRequireAdmin(returnTo);

  const { user } = useAuth();

  const createdBy = resolveAuthUserId(user);



  const {

    inputValue,

    fieldError,

    saveError,

    error: loadError,

    isLoading,

    isRefreshing,

    isSaving,

    canSave,

    handleInputChange,

    save,

    refresh,

    clearSaveError,

  } = useAdminCommissionRateEditor(rateType, {

    enabled: isAuthorized,

    createdBy,

  });



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  const title = getAdminCommissionRateSettingLabel(rateType);

  const parsedValue = inputValue.trim() ? Number(inputValue) : null;

  const currentLabel =

    parsedValue != null && Number.isFinite(parsedValue)

      ? formatAdminCommissionRateDisplay(parsedValue)

      : isLoading

        ? 'Loading…'

        : 'Not set';



  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}

      keyboardShouldPersistTaps="handled"

      refreshControl={

        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />

      }

    >

      <AdminSettingsDetailHero

        title={title}

        icon={COMMISSION_RATE_ICONS[rateType]}

        statusLabel={`Current rate: ${currentLabel}`}

        statusIcon="trending-up-outline"

      />



      <AdminProductDetailCardShell title="Commission percentage" icon="create-outline" accent>

        <AppInput

          label="Commission %"

          tone="surface"

          value={inputValue}

          onChangeText={handleInputChange}

          keyboardType="number-pad"

          placeholder="0"

          editable={!isSaving}

          error={fieldError ?? undefined}

          maxLength={2}

        />



        <AppButton

          label={isSaving ? 'Saving…' : 'Save changes'}

          onPress={() => void save()}

          loading={isSaving}

          disabled={!canSave}

          fullWidth

        />

      </AdminProductDetailCardShell>



      {saveError ? (

        <ErrorState message={saveError} onAction={clearSaveError} style={styles.error} />

      ) : null}



      {loadError && !inputValue ? (

        <ErrorState message={loadError} onAction={() => void refresh()} style={styles.error} />

      ) : null}

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

  error: {

    marginHorizontal: 0,

    alignSelf: 'stretch',

  },

});

