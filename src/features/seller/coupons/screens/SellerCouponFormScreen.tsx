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
import { DateField, KeyboardAwareFormScreen, SelectField, useKeyboardAwareForm } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { useSellerCouponForm } from '../hooks/useSellerCouponForm';
import { COUPON_CODE_MAX_LEN } from '../../../../utils/couponCodeRules';
import { getDateYearsFromNow, getTodayStartDate } from '../../../../utils/dateInput';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerCouponForm'>;

const COUPON_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed' },
];

export function SellerCouponFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const formControls = useKeyboardAwareForm(scrollRef);
  const onFieldFocus = formControls.onFieldFocus;
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);
  const { couponId, initialCoupon } = route.params ?? {};
  const returnTo = couponId
    ? authReturnTo.sellerCouponForm(couponId, initialCoupon)
    : authReturnTo.sellerCouponForm();
  const { isAuthorized } = useRequireSeller(returnTo);

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
  } = useSellerCouponForm({
    userId: isAuthorized ? userId : undefined,
    couponId,
    initialCoupon,
    enabled: isAuthorized,
  });

  const handleSubmit = async () => {
    const notice = await submit();
    if (notice) {
      navigation.navigate('SellerCoupons', { notice });
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
                navigation.navigate('SellerCoupons', { notice });
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

  if (isLoading && !initialCoupon) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupon...
        </AppText>
      </View>
    );
  }

  if (loadError && !initialCoupon) {
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
            tone="surface"
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
            tone="surface"
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
            tone="surface"
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
            tone="surface"
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
            tone="surface"
            label="Minimum cart amount *"
            value={values.minimumCartAmount}
            onChangeText={(text) => updateField('minimumCartAmount', text)}
            onFocus={onFieldFocus}
            placeholder="Enter minimum cart amount"
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.minimumCartAmount}
          />

          <DateField
            tone="surface"
            label="Expiration date *"
            value={values.expirationDate}
            onChange={(text) => updateField('expirationDate', text)}
            placeholder="Select expiration date"
            error={errors.expirationDate}
            disabled={isBusy}
            minimumDate={getTodayStartDate()}
            maximumDate={getDateYearsFromNow(10)}
          />

          <AppInput
            tone="surface"
            label="Usage limit per coupon *"
            value={values.usageLimitPerCoupon}
            onChangeText={(text) => updateField('usageLimitPerCoupon', text)}
            onFocus={onFieldFocus}
            keyboardType="number-pad"
            editable={!isBusy}
            error={errors.usageLimitPerCoupon}
          />

          <AppInput
            tone="surface"
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
          <AppText variant="bodySmall" color="error">
            {deleteError}
          </AppText>
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
            label={isDeleting ? 'Deleting...' : 'Delete coupon'}
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
});
