import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CountryStateFields } from '../../../components/forms';
import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { ApiError } from '../../../services/api/errors';
import { spacing } from '../../../design-system';
import {
  buildSellerReferralId,
  registerBuyer,
  registerSeller,
} from '../api/registrationApi';
import { AuthErrorText } from '../components/AuthForm';
import { AuthFlowScreen } from '../components/AuthFlowScreen';
import { RegistrationAgreeField } from '../components/RegistrationAgreeField';
import { RegistrationReferralFields } from '../components/RegistrationReferralFields';
import {
  createEmptyRegistrationFormValues,
  type RegistrationFormErrors,
  type RegistrationFormField,
  type RegistrationFormValues,
} from '../types/registration';
import { useRegistrationCountryOptions } from '../utils/registrationCountries';
import { validateRegistrationForm } from '../utils/registrationValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterAccount'>;

export function RegisterAccountScreen({ navigation, route }: Props) {
  const { accountType } = route.params;
  const isSeller = accountType === 'seller';
  const countryOptions = useRegistrationCountryOptions();

  const [values, setValues] = useState<RegistrationFormValues>(createEmptyRegistrationFormValues);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const screenCopy = useMemo(
    () =>
      isSeller
        ? {
            title: 'Register as seller',
            subtitle:
              'Join the AFOMA artisan community. Complete the form below to create your seller account.',
            submitLabel: 'Register as seller',
          }
        : {
            title: 'Register as buyer',
            subtitle: 'Create your buyer account to shop, track orders, and save addresses.',
            submitLabel: 'Create account',
          },
    [isSeller],
  );

  const handleChange = <K extends RegistrationFormField>(field: K, nextValue: RegistrationFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    const errors = validateRegistrationForm(values, accountType);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      if (isSeller) {
        await registerSeller({
          enableProduct: false,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          country: values.country,
          state: values.state,
          city: values.city.trim(),
          storeTitle: values.storeTitle.trim(),
          ZipCode: values.zipCode.trim(),
          streetAddress: values.streetAddress.trim(),
          userRole: 'seller',
          status: 'Approved',
          countryCode: values.countryCode,
          stateCode: values.stateCode,
          referral_source: values.referralSource,
          referral_id: buildSellerReferralId(values.referralSource, values.referralId),
          social_media: values.socialMedia,
          social_media_handle: values.socialMediaHandle.trim(),
        });
      } else {
        const response = await registerBuyer({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          country: values.country,
          state: values.state,
          city: values.city.trim(),
          ZipCode: values.zipCode.trim(),
          phone: values.phone.trim(),
          streetAddress: values.streetAddress.trim(),
          userRole: 'customer',
          countryCode: values.countryCode,
          stateCode: values.stateCode,
          referral_source: values.referralSource,
          social_media: values.socialMedia,
        });

        const message =
          typeof response === 'object' &&
          response !== null &&
          'message' in response &&
          typeof (response as { message?: unknown }).message === 'string'
            ? (response as { message: string }).message
            : '';

        if (message === 'User is Alredy Exist') {
          setSubmitError('An account with this email already exists.');
          setFieldErrors((current) => ({ ...current, email: 'Email is already in use.' }));
          return;
        }
      }

      navigation.replace('RegistrationSuccess', { accountType });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 403) {
        setSubmitError('An account with this email already exists.');
        setFieldErrors((current) => ({ ...current, email: 'Email is already in use.' }));
        return;
      }

      setSubmitError(
        error instanceof Error ? error.message : 'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFlowScreen
      title={screenCopy.title}
      subtitle={screenCopy.subtitle}
      onBack={() => navigation.goBack()}
      footer={
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')}>
          <AppText variant="bodySmall" color="textSecondary" style={styles.signInLink}>
            Already have an account?{' '}
            <AppText variant="bodySmall" color="textLink">
              Sign in
            </AppText>
          </AppText>
        </Pressable>
      }
    >
      <AppInput
        label="First name *"
        value={values.firstName}
        onChangeText={(next) => handleChange('firstName', next)}
        error={fieldErrors.firstName}
        autoCapitalize="words"
        editable={!loading}
      />
      <AppInput
        label="Last name *"
        value={values.lastName}
        onChangeText={(next) => handleChange('lastName', next)}
        error={fieldErrors.lastName}
        autoCapitalize="words"
        editable={!loading}
      />
      <AppInput
        label="Email *"
        value={values.email}
        onChangeText={(next) => handleChange('email', next)}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <AppInput
        label="Phone *"
        value={values.phone}
        onChangeText={(next) => handleChange('phone', next)}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
        editable={!loading}
      />

      {isSeller ? (
        <AppInput
          label="Shop / store name *"
          value={values.storeTitle}
          onChangeText={(next) => handleChange('storeTitle', next)}
          error={fieldErrors.storeTitle}
          editable={!loading}
        />
      ) : null}

      <AppInput
        label="Street address *"
        value={values.streetAddress}
        onChangeText={(next) => handleChange('streetAddress', next)}
        error={fieldErrors.streetAddress}
        editable={!loading}
      />
      <AppInput
        label="City *"
        value={values.city}
        onChangeText={(next) => handleChange('city', next)}
        error={fieldErrors.city}
        autoCapitalize="words"
        editable={!loading}
      />

      <CountryStateFields
        value={{
          country: values.country,
          state: values.state,
          countryCode: values.countryCode,
          stateCode: values.stateCode,
        }}
        countryOptions={countryOptions}
        onChange={(selection) => {
          handleChange('country', selection.country);
          handleChange('state', selection.state);
          handleChange('countryCode', selection.countryCode);
          handleChange('stateCode', selection.stateCode);
        }}
        countryError={fieldErrors.country}
        stateError={fieldErrors.state}
        disabled={loading}
        required
      />

      <AppInput
        label="ZIP / Postal code *"
        value={values.zipCode}
        onChangeText={(next) => handleChange('zipCode', next)}
        error={fieldErrors.zipCode}
        autoCapitalize="characters"
        editable={!loading}
      />

      <RegistrationReferralFields
        values={values}
        errors={fieldErrors}
        onChange={handleChange}
        disabled={loading}
        showSocialFields={isSeller}
      />

      <RegistrationAgreeField
        value={values.agree}
        onChange={(next) => handleChange('agree', next)}
        error={fieldErrors.agree}
        disabled={loading}
      />

      <AuthErrorText message={submitError} />

      <AppButton
        label={screenCopy.submitLabel}
        fullWidth
        size="lg"
        shape="pill"
        loading={loading}
        onPress={() => void handleSubmit()}
        style={{ marginTop: spacing.sm }}
      />
    </AuthFlowScreen>
  );
}

const styles = StyleSheet.create({
  signInLink: {
    textAlign: 'center',
  },
});
