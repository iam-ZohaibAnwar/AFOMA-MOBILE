import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountryStateFields } from '../../../../components/forms';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { createCountryStateSelection } from '../../../../utils/regionOptions';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminPasswordField } from '../components/AdminPasswordField';
import { useAdminCreateSeller } from '../hooks/useAdminCreateSeller';
import { requestAdminSellerListRefresh } from '../state/adminSellerListRefresh';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCreateSeller'>;

const CREATE_RETURN_TO = authReturnTo.adminCreateSeller();

export function AdminCreateSellerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(CREATE_RETURN_TO);

  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    updateField,
    updateAddressRegion,
    submitCreateSeller,
    clearSubmitError,
  } = useAdminCreateSeller();

  const handleSubmit = useCallback(async () => {
    const didCreate = await submitCreateSeller();
    if (!didCreate) {
      return;
    }

    requestAdminSellerListRefresh({ resetToFirstPage: true });

    Alert.alert('Seller created', 'The new seller was added with Pending approval.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, submitCreateSeller]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AppCard>
        <AppText variant="label" style={styles.sectionTitle}>
          Basic information
        </AppText>
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
          <AdminPasswordField
            tone="surface"
            label="Password *"
            value={values.password}
            onChangeText={(value) => updateField('password', value)}
            error={fieldErrors.password}
            placeholder="Minimum 5 characters"
          />
          <AppInput
            tone="surface"
            label="Contact number *"
            value={values.phone}
            onChangeText={(value) => updateField('phone', value)}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
            placeholder="+1234567890"
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="label" style={styles.sectionTitle}>
          Shop details
        </AppText>
        <AppInput
          tone="surface"
          label="Shop title *"
          value={values.storeTitle}
          onChangeText={(value) => updateField('storeTitle', value)}
          error={fieldErrors.storeTitle}
          placeholder="Enter shop title"
        />
      </AppCard>

      <AppCard>
        <AppText variant="label" style={styles.sectionTitle}>
          Address
        </AppText>
        <View style={styles.form}>
          <CountryStateFields
            tone="surface"
            value={createCountryStateSelection(values.country, values.state, {
              countryCode: values.countryCode,
              stateCode: values.stateCode,
            })}
            onChange={(selection) =>
              updateAddressRegion({
                country: selection.country,
                countryCode: selection.countryCode,
                state: selection.state,
                stateCode: selection.stateCode,
              })
            }
            countryError={fieldErrors.country}
            stateError={fieldErrors.state}
            required
          />
          <AppInput
            tone="surface"
            label="City *"
            value={values.city}
            onChangeText={(value) => updateField('city', value)}
            error={fieldErrors.city}
          />
          <AppInput
            tone="surface"
            label="Zip / postal code *"
            value={values.zipCode}
            onChangeText={(value) => updateField('zipCode', value)}
            error={fieldErrors.zipCode}
          />
          <AppInput
            tone="surface"
            label="Street address *"
            value={values.streetAddress}
            onChangeText={(value) => updateField('streetAddress', value)}
            error={fieldErrors.streetAddress}
            multiline
            numberOfLines={2}
          />
        </View>
      </AppCard>

      {submitError ? (
        <ErrorState message={submitError} onAction={clearSubmitError} style={styles.submitError} />
      ) : null}

      <AppButton
        label={isSubmitting ? 'Creating seller...' : 'Create seller'}
        onPress={() => void handleSubmit()}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
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
  sectionTitle: {
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  submitError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
