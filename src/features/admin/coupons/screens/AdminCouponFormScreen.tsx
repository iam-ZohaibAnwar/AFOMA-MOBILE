import { useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { KeyboardAwareFormScreen, SelectField, useKeyboardAwareForm } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { COUPON_CODE_MAX_LEN } from '../../../../utils/couponCodeRules';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useAdminCouponForm } from '../hooks/useAdminCouponForm';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCouponForm'>;

const COUPON_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed' },
];

export function AdminCouponFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const formControls = useKeyboardAwareForm(scrollRef);
  const onFieldFocus = formControls.onFieldFocus;
  const { user } = useAuth();
  const adminUserId = resolveAuthUserId(user);
  const { couponId, initialCoupon } = route.params ?? {};
  const returnTo = couponId
    ? authReturnTo.adminCouponForm(couponId)
    : authReturnTo.adminCouponForm();
  const { isAuthorized } = useRequireAdmin(returnTo);

  const {
    values,
    errors,
    isEditMode,
    isLoading,
    isSaving,
    isDeleting,
    isBusy,
    loadError,
    saveError,
    deleteError,
    updateField,
    submit,
    deleteCoupon,
  } = useAdminCouponForm({
    adminUserId: isAuthorized ? adminUserId : undefined,
    couponId,
    initialCoupon,
    enabled: isAuthorized,
  });

  const handleSubmit = async () => {
    const notice = await submit();
    if (notice) {
      navigation.navigate('AdminCoupons', { notice });
    }
  };

  const handleDeletePress = () => {
    if (isBusy) {
      return;
    }

    Alert.alert(
      'Delete coupon',
      `Are you sure you want to delete ${values.couponCode || 'this coupon'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const notice = await deleteCoupon();
              if (notice) {
                navigation.navigate('AdminCoupons', { notice });
              }
            })();
          },
        },
      ],
    );
  };

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && isEditMode) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupon…
        </AppText>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={loadError} onAction={() => navigation.goBack()} actionLabel="Go back" />
      </View>
    );
  }

  const discountHint =
    values.couponType === 'percentage'
      ? 'Enter percentage (1–100)'
      : values.couponType === 'fixed'
        ? 'Enter fixed discount amount'
        : 'Enter discount';

  return (
    <KeyboardAwareFormScreen
      scrollRef={scrollRef}
      formControls={formControls}
      contentContainerStyle={styles.content}
    >
      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.pageTitle}>
          {isEditMode ? 'Edit coupon' : 'Add coupon'}
        </AppText>
        <AppText variant="caption" color="error">
          Fields marked with * are required.
        </AppText>

        <View style={styles.form}>
          <AppInput
            label="Coupon code *"
            value={values.couponCode}
            onChangeText={(text) => updateField('couponCode', text)}
            onFocus={onFieldFocus}
            placeholder="Enter coupon code"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={COUPON_CODE_MAX_LEN}
            editable={!isBusy}
            error={errors.couponCode}
          />

          <SelectField
            label="Coupon type *"
            value={values.couponType}
            options={COUPON_TYPE_OPTIONS}
            onChange={(value) => updateField('couponType', value as typeof values.couponType)}
            placeholder="Select type"
            error={errors.couponType}
            modalTitle="Coupon type"
            disabled={isBusy}
          />

          <AppInput
            label="Discount *"
            value={values.discountAmount}
            onChangeText={(text) => updateField('discountAmount', text)}
            onFocus={onFieldFocus}
            placeholder={discountHint}
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.discountAmount}
          />

          <AppInput
            label="Description"
            value={values.description}
            onChangeText={(text) => updateField('description', text)}
            onFocus={onFieldFocus}
            placeholder="Describe the coupon"
            multiline
            numberOfLines={4}
            editable={!isBusy}
            style={styles.textArea}
          />

          <AppInput
            label="Minimum cart amount *"
            value={values.minimumCartAmount}
            onChangeText={(text) => updateField('minimumCartAmount', text)}
            onFocus={onFieldFocus}
            placeholder="Enter minimum cart amount"
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.minimumCartAmount}
          />

          <AppInput
            label="Expiration date *"
            value={values.expirationDate}
            onChangeText={(text) => updateField('expirationDate', text)}
            onFocus={onFieldFocus}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isBusy}
            error={errors.expirationDate}
          />

          <AppInput
            label="Usage limit per coupon *"
            value={values.usageLimitPerCoupon}
            onChangeText={(text) => updateField('usageLimitPerCoupon', text)}
            onFocus={onFieldFocus}
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.usageLimitPerCoupon}
          />

          <AppInput
            label="Usage limit per customer *"
            value={values.usageLimitPerCustomer}
            onChangeText={(text) => updateField('usageLimitPerCustomer', text)}
            onFocus={onFieldFocus}
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.usageLimitPerCustomer}
          />
        </View>
      </AppCard>

      <View style={styles.actions}>
        {saveError ? (
          <AppText variant="bodySmall" color="error">
            {saveError}
          </AppText>
        ) : null}
        {deleteError ? (
          <ErrorState message={deleteError} onAction={() => void deleteCoupon()} style={styles.inlineError} />
        ) : null}

        <AppButton
          label={isEditMode ? 'Update coupon' : 'Create coupon'}
          onPress={() => void handleSubmit()}
          loading={isSaving}
          disabled={isBusy}
          fullWidth
        />
        <AppButton
          label="Cancel"
          variant="secondary"
          onPress={() => navigation.goBack()}
          disabled={isBusy}
          fullWidth
        />
        {isEditMode ? (
          <AppButton
            label={isDeleting ? 'Deleting…' : 'Delete coupon'}
            variant="outline"
            onPress={handleDeletePress}
            loading={isDeleting}
            disabled={isBusy}
            fullWidth
            labelStyle={styles.deleteLabel}
          />
        ) : null}
      </View>
    </KeyboardAwareFormScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  deleteLabel: {
    color: colors.error,
  },
  inlineError: {
    marginTop: 0,
    marginBottom: 0,
  },
});
