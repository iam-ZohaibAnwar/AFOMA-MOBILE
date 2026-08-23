import { useCallback, useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountryStateFields, SelectField } from '../../../../components/forms';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { createCountryStateSelection } from '../../../../utils/regionOptions';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AccountGenderSelector } from '../../../account/components/AccountGenderSelector';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminUserProfilePhotoField } from '../components/AdminUserProfilePhotoField';
import { useAdminUserForm } from '../hooks/useAdminUserForm';
import {
  ADMIN_USER_CREATE_ROLE_OPTIONS,
  ADMIN_USER_EDIT_ROLE_OPTIONS,
  ADMIN_USER_FULL_ACCESS_OPTIONS,
} from '../utils/adminUserRoleOptions';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserForm'>;

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="label" style={styles.sectionTitle}>
      {children}
    </AppText>
  );
}

export function AdminUserFormScreen({ navigation, route }: Props) {
  const { userId, mode, initialUser } = route.params;
  const isEditMode = mode === 'edit';
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminUserForm({ userId, mode, initialUser });
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(returnTo);
  const { role } = useAuth();

  const form = useAdminUserForm({
    mode,
    userId,
    initialUser,
    creatorRole: role ?? 'admin',
  });

  const roleOptions = useMemo(
    () => (isEditMode ? ADMIN_USER_EDIT_ROLE_OPTIONS : ADMIN_USER_CREATE_ROLE_OPTIONS),
    [isEditMode],
  );

  const handleSave = useCallback(async () => {
    const saved = isEditMode ? await form.submitUpdateUser() : await form.submitCreateUser();
    const savedId = saved?._id ?? userId;

    if (!savedId) {
      return;
    }

    navigation.replace('AdminUserDetail', {
      userId: savedId,
      initialUser: saved ?? initialUser,
    });
  }, [form, initialUser, isEditMode, navigation, userId]);

  if (isGateLoading || !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isEditMode && !userId) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ErrorState message="Missing user id for edit." />
      </View>
    );
  }

  const showFullAccess = form.values.userRole === 'admin';
  const canRenderForm =
    !isEditMode || Boolean(initialUser) || !form.isHydrating || Boolean(form.values.userRole);

  if (isEditMode && form.hydrationError && !initialUser && !canRenderForm) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ErrorState
          message={form.hydrationError}
          actionLabel="Retry"
          onAction={() => form.retryHydration()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard variant="muted">
          <AppText variant="h3">{isEditMode ? 'Edit user' : 'Create user'}</AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {isEditMode
              ? 'Update profile, role, permissions, address, and Web3 details.'
              : 'Add a customer, affiliate, or admin account. Seller accounts are created in Seller Management.'}
          </AppText>
        </AppCard>

        {isEditMode && form.isHydrating ? (
          <View style={styles.hydrationRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="caption" color="textSecondary">
              Refreshing user details...
            </AppText>
          </View>
        ) : null}

        {form.hydrationError ? (
          <ErrorState
            message={form.hydrationError}
            actionLabel="Retry"
            onAction={() => form.retryHydration()}
            style={styles.inlineError}
          />
        ) : null}

        {form.submitError ? (
          <ErrorState
            message={form.submitError}
            actionLabel="Dismiss"
            onAction={form.clearSubmitError}
            style={styles.inlineError}
          />
        ) : null}

        {canRenderForm ? (
          <>
            <AppCard>
              <SectionTitle>Profile</SectionTitle>
              <View style={styles.form}>
                <AdminUserProfilePhotoField
                  imageUrl={form.values.userProfile}
                  localUri={form.values.profileLocalUri}
                  isUploading={form.isUploadingProfile}
                  uploadError={form.profileUploadError}
                  onPickPhoto={() => void form.pickProfilePhoto()}
                  onRetryUpload={() => void form.retryProfileUpload()}
                  onRemovePhoto={form.removeProfilePhoto}
                />
                <AppInput
                  label="First name *"
                  value={form.values.firstName}
                  onChangeText={(value) => form.updateField('firstName', value)}
                  error={form.fieldErrors.firstName}
                  autoCapitalize="words"
                />
                <AppInput
                  label="Last name *"
                  value={form.values.lastName}
                  onChangeText={(value) => form.updateField('lastName', value)}
                  error={form.fieldErrors.lastName}
                  autoCapitalize="words"
                />
                <AppInput
                  label="Email *"
                  value={form.values.email}
                  onChangeText={(value) => form.updateField('email', value)}
                  error={form.fieldErrors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AppInput
                  label="Phone *"
                  value={form.values.phone}
                  onChangeText={(value) => form.updateField('phone', value)}
                  error={form.fieldErrors.phone}
                  keyboardType="phone-pad"
                  placeholder="+1234567890"
                />
                <AppInput
                  label="Date of birth"
                  value={form.values.dob}
                  onChangeText={(value) => form.updateField('dob', value)}
                  error={form.fieldErrors.dob}
                  placeholder="YYYY-MM-DD"
                />
                <AccountGenderSelector
                  value={form.values.gender}
                  onChange={(value) => form.updateField('gender', value)}
                  error={form.fieldErrors.gender}
                />
              </View>
            </AppCard>

            <AppCard>
              <SectionTitle>Role</SectionTitle>
              <SelectField
                label="User role *"
                value={form.values.userRole}
                options={roleOptions}
                onChange={(value) =>
                  form.updateField('userRole', value as typeof form.values.userRole)
                }
                placeholder="Select role"
                error={form.fieldErrors.userRole}
                modalTitle="Select user role"
              />
            </AppCard>

            {showFullAccess ? (
              <AppCard>
                <SectionTitle>Admin permissions</SectionTitle>
                <AppText variant="caption" color="textSecondary" style={styles.fullAccessHint}>
                  Sets this user&apos;s elevated admin permissions — not your signed-in access
                  level.
                </AppText>
                <SelectField
                  label="Full access"
                  value={form.values.fullAccess ? 'true' : 'false'}
                  options={ADMIN_USER_FULL_ACCESS_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value ? 'true' : 'false',
                  }))}
                  onChange={(value) => form.updateField('fullAccess', value === 'true')}
                  modalTitle="Full access"
                />
              </AppCard>
            ) : null}

            <AppCard>
              <SectionTitle>Address</SectionTitle>
              <View style={styles.form}>
                <CountryStateFields
                  value={createCountryStateSelection(form.values.country, form.values.state, {
                    countryCode: form.values.countryCode,
                    stateCode: form.values.stateCode,
                  })}
                  onChange={form.updateAddressRegion}
                  countryError={form.fieldErrors.country}
                  stateError={form.fieldErrors.state}
                  required
                />
                <AppInput
                  label="City *"
                  value={form.values.city}
                  onChangeText={(value) => form.updateField('city', value)}
                  error={form.fieldErrors.city}
                />
                <AppInput
                  label="Street address *"
                  value={form.values.streetAddress}
                  onChangeText={(value) => form.updateField('streetAddress', value)}
                  error={form.fieldErrors.streetAddress}
                />
                <AppInput
                  label="ZIP *"
                  value={form.values.zipCode}
                  onChangeText={(value) => form.updateField('zipCode', value)}
                  error={form.fieldErrors.zipCode}
                />
              </View>
            </AppCard>

            <AppCard>
              <SectionTitle>Web3</SectionTitle>
              <AppInput
                label="Wallet address"
                value={form.values.web3address}
                onChangeText={(value) => form.updateField('web3address', value)}
                autoCapitalize="none"
              />
            </AppCard>

            <AppButton
              label={
                form.isSaving
                  ? isEditMode
                    ? 'Saving changes...'
                    : 'Creating user...'
                  : isEditMode
                    ? 'Save changes'
                    : 'Create user'
              }
              onPress={() => void handleSave()}
              disabled={form.isSaving || form.isUploadingProfile}
              loading={form.isSaving}
            />
          </>
        ) : (
          <View style={styles.hydrationRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="bodySmall" color="textSecondary">
              Loading user...
            </AppText>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  fullAccessHint: {
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  inlineError: {
    marginTop: 0,
  },
  hydrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
