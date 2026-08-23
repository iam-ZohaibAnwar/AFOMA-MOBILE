import { useMemo } from 'react';

import {

  ActivityIndicator,

  KeyboardAvoidingView,

  Platform,

  ScrollView,

  StyleSheet,

  View,

} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { CountryStateFields } from '../../../components/forms';

import { ErrorState } from '../../../components/ecommerce/ErrorState';

import { AppButton } from '../../../components/ui/AppButton';

import { AppCard } from '../../../components/ui/AppCard';

import { AppInput } from '../../../components/ui/AppInput';

import { AppText } from '../../../components/ui/AppText';

import { colors, spacing } from '../../../design-system';

import type { ShoppingStackParamList } from '../../../app/navigation/types';

import { useAuth } from '../../auth/hooks/useAuth';

import { useRequireAuth } from '../../auth/hooks/useRequireAuth';

import { authReturnTo } from '../../auth/utils/authNavigation';

import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';

import { AccountGenderSelector } from '../components/AccountGenderSelector';

import { useAccountDetails } from '../hooks/useAccountDetails';



type Props = NativeStackScreenProps<ShoppingStackParamList, 'AccountDetails'>;



const ACCOUNT_DETAILS_RETURN_TO = authReturnTo.accountDetails();



function SectionTitle({ children }: { children: string }) {

  return (

    <AppText variant="bodyMedium" style={styles.sectionTitle}>

      {children}

    </AppText>

  );

}



export function AccountDetailsScreen(_props: Props) {

  const insets = useSafeAreaInsets();

  const { isAuthorized } = useRequireAuth(ACCOUNT_DETAILS_RETURN_TO);

  const { user } = useAuth();

  const authUserId = resolveAuthUserId(user);



  const {

    values,

    fieldErrors,

    isLoading,

    isSaving,

    loadError,

    saveError,

    saveSuccessMessage,

    updateField,

    updateCountryState,

    saveProfile,

    retry,

  } = useAccountDetails(authUserId, user);



  const bottomPadding = useMemo(() => insets.bottom + spacing.xxl, [insets.bottom]);



  const countryStateValue = useMemo(

    () => ({

      country: values.country,

      state: values.state,

      countryCode: values.countryCode,

      stateCode: values.stateCode,

    }),

    [values.country, values.countryCode, values.state, values.stateCode],

  );



  if (!isAuthorized) {

    return (

      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>

        <ActivityIndicator size="large" color={colors.primary} />

      </View>

    );

  }



  if (isLoading) {

    return (

      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>

        <ActivityIndicator size="large" color={colors.primary} />

        <AppText variant="bodySmall" color="textMuted">

          Loading account details...

        </AppText>

      </View>

    );

  }



  return (

    <KeyboardAvoidingView

      style={styles.flex}

      behavior={Platform.OS === 'ios' ? 'padding' : undefined}

    >

      <ScrollView

        style={styles.screen}

        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={false}

      >

        {loadError ? (

          <ErrorState message={loadError} onAction={() => void retry()} style={styles.banner} />

        ) : null}



        {saveSuccessMessage ? (

          <AppCard variant="flat" style={styles.successBanner}>

            <AppText variant="bodySmall" color="success">

              {saveSuccessMessage}

            </AppText>

          </AppCard>

        ) : null}



        {saveError ? (

          <ErrorState message={saveError} style={styles.banner} />

        ) : null}



        <AppCard variant="muted">

          <SectionTitle>Account Information</SectionTitle>



          <View style={styles.fieldGroup}>

            <AppInput

              label="First Name *"

              value={values.firstName}

              onChangeText={(text) => updateField('firstName', text)}

              error={fieldErrors.firstName}

              autoCapitalize="words"

              editable={!isSaving}

            />

            <AppInput

              label="Last Name *"

              value={values.lastName}

              onChangeText={(text) => updateField('lastName', text)}

              error={fieldErrors.lastName}

              autoCapitalize="words"

              editable={!isSaving}

            />

            <AppInput

              label="Email *"

              value={values.email}

              onChangeText={(text) => updateField('email', text)}

              error={fieldErrors.email}

              keyboardType="email-address"

              autoCapitalize="none"

              autoCorrect={false}

              editable={!isSaving}

            />

            <AppInput

              label="Contact No. *"

              value={values.phone}

              onChangeText={(text) => updateField('phone', text)}

              error={fieldErrors.phone}

              keyboardType="phone-pad"

              editable={!isSaving}

            />

            <AccountGenderSelector

              value={values.gender}

              onChange={(nextValue) => updateField('gender', nextValue)}

              error={fieldErrors.gender}

            />

            <AppInput

              label="Date of Birth"

              value={values.dob}

              onChangeText={(text) => updateField('dob', text)}

              error={fieldErrors.dob}

              placeholder="YYYY-MM-DD"

              autoCapitalize="none"

              editable={!isSaving}

            />

          </View>

        </AppCard>



        <AppCard variant="muted">

          <SectionTitle>Address</SectionTitle>



          <View style={styles.fieldGroup}>

            <CountryStateFields

              value={countryStateValue}

              onChange={updateCountryState}

              countryError={fieldErrors.country}

              stateError={fieldErrors.state}

              disabled={isSaving}

              required

            />

            <AppInput

              label="City *"

              value={values.city}

              onChangeText={(text) => updateField('city', text)}

              error={fieldErrors.city}

              autoCapitalize="words"

              editable={!isSaving}

            />

            <AppInput

              label="Street Address *"

              value={values.streetAddress}

              onChangeText={(text) => updateField('streetAddress', text)}

              error={fieldErrors.streetAddress}

              editable={!isSaving}

            />

            <AppInput

              label="Zip/Postal Code *"

              value={values.zipCode}

              onChangeText={(text) => updateField('zipCode', text)}

              error={fieldErrors.zipCode}

              autoCapitalize="characters"

              editable={!isSaving}

            />

          </View>

        </AppCard>



        <AppButton

          label="Save"

          fullWidth

          size="lg"

          loading={isSaving}

          onPress={() => void saveProfile()}

        />

      </ScrollView>

    </KeyboardAvoidingView>

  );

}



const styles = StyleSheet.create({

  flex: {

    flex: 1,

    backgroundColor: colors.background,

  },

  screen: {

    flex: 1,

    backgroundColor: colors.background,

  },

  content: {

    padding: spacing.lg,

    gap: spacing.lg,

  },

  centeredState: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    padding: spacing.xl,

    backgroundColor: colors.background,

    gap: spacing.md,

  },

  sectionTitle: {

    color: colors.textPrimary,

    fontWeight: '700',

    marginBottom: spacing.md,

  },

  fieldGroup: {

    gap: spacing.md,

  },

  banner: {

    alignSelf: 'stretch',

    marginHorizontal: 0,

  },

  successBanner: {

    backgroundColor: colors.successBg,

    borderColor: colors.successSoft,

  },

});


