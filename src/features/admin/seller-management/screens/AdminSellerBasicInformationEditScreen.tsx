import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareFormScreen } from '../../../../components/forms';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { AccountGenderSelector } from '../../../account/components/AccountGenderSelector';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useAdminSellerBasicInfoSave } from '../hooks/useAdminSellerBasicInfoSave';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerBasicInformationEdit'>;

export function AdminSellerBasicInformationEditScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerBasicInformationEdit(sellerId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const { seller, syncSessionPatch } = useAdminSellerDetail(
    isAuthorized ? sellerId : undefined,
    initialSeller,
  );

  const displaySeller = seller ?? initialSeller;

  const {
    values,
    fieldErrors,
    isDirty,
    isSaving,
    saveError,
    saveSuccess,
    updateField,
    saveBasicInfo,
    clearSaveError,
  } = useAdminSellerBasicInfoSave(isAuthorized ? sellerId : undefined, displaySeller);

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const handleSave = useCallback(async () => {
    clearSaveError();
    const updatedSeller = await saveBasicInfo();
    if (updatedSeller) {
      Alert.alert('Saved', 'Basic information updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [clearSaveError, navigation, saveBasicInfo]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <KeyboardAwareFormScreen contentContainerStyle={styles.content}>
      <AppCard>
        <View style={styles.form}>
          <AppInput
            tone="surface"
            label="First name *"
            value={values.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            error={fieldErrors.firstName}
            autoCapitalize="words"
          />
          <AppInput
            tone="surface"
            label="Last name *"
            value={values.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            error={fieldErrors.lastName}
            autoCapitalize="words"
          />
          <AppInput
            tone="surface"
            label="Email *"
            value={values.email}
            onChangeText={(value) => updateField('email', value)}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AccountGenderSelector
            tone="surface"
            value={values.gender}
            onChange={(value) => updateField('gender', value)}
            error={fieldErrors.gender}
          />
          <AppInput
            tone="surface"
            label="Date of birth"
            value={values.dob}
            onChangeText={(value) => updateField('dob', value)}
            error={fieldErrors.dob}
            placeholder="YYYY-MM-DD"
          />
          <AppInput
            tone="surface"
            label="Contact number"
            value={values.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
          />
        </View>
      </AppCard>

      {saveError ? (
        <ErrorState message={saveError} onAction={clearSaveError} style={styles.inlineError} />
      ) : null}

      {saveSuccess ? (
        <AppText variant="bodySmall" color="textSecondary">
          Basic information saved.
        </AppText>
      ) : null}

      <AppButton
        label={isSaving ? 'Saving...' : 'Save basic information'}
        onPress={() => void handleSave()}
        loading={isSaving}
        disabled={!isDirty || isSaving}
      />
    </KeyboardAwareFormScreen>
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
  form: {
    gap: spacing.md,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
