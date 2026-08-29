import { useCallback } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { useSellerSetupImageUpload } from '../../../seller/hooks/useSellerSetupImageUpload';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerSectionEditForm, type AdminSellerSectionEditFormProps } from '../components/AdminSellerSectionEditForm';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';
import { useAdminSellerSectionSave } from '../hooks/useAdminSellerSectionSave';
import { getAdminSellerSectionTitle } from '../utils/adminSellerSectionForms';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerSectionEdit'>;

export function AdminSellerSectionEditScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, sectionId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerSectionEdit(sellerId, sectionId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const sectionTitle = getAdminSellerSectionTitle(sectionId);

  const { seller, syncSessionPatch, applySellerUpdate } = useAdminSellerDetail(
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
    updateField,
    updateValues,
    saveSection,
    clearSaveError,
  } = useAdminSellerSectionSave(sectionId, isAuthorized ? sellerId : undefined, displaySeller);

  const { isUploading, uploadError, pickAndUpload } = useSellerSetupImageUpload();

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const handleSave = useCallback(async () => {
    clearSaveError();
    const updatedSeller = await saveSection();
    if (!updatedSeller) {
      return;
    }

    applySellerUpdate(updatedSeller);

    Alert.alert('Saved', `${sectionTitle} updated successfully.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [applySellerUpdate, clearSaveError, navigation, saveSection, sectionTitle]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const sectionFormProps = {
    sectionId,
    values,
    fieldErrors,
    seller: displaySeller,
    isUploading,
    uploadError,
    onFieldChange: updateField,
    onAddressChange: (selection: {
      country: string;
      countryCode: string;
      state: string;
      stateCode: string;
    }) => updateValues(selection),
    onPickImage: pickAndUpload,
  } as AdminSellerSectionEditFormProps;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard>
          <AdminSellerSectionEditForm {...sectionFormProps} />
        </AppCard>

        {saveError ? (
          <ErrorState message={saveError} onAction={clearSaveError} style={styles.inlineError} />
        ) : null}

        <AppButton
          label={isSaving ? 'Saving...' : `Save ${sectionTitle.toLowerCase()}`}
          onPress={() => void handleSave()}
          loading={isSaving}
          disabled={!isDirty || isSaving || isUploading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
