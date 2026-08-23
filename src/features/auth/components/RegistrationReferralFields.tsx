import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectField } from '../../../components/forms';
import { AppInput } from '../../../components/ui/AppInput';
import { spacing } from '../../../design-system';
import {
  fetchBuyerReferralOptions,
  fetchSellerReferralOptions,
} from '../api/registrationApi';
import {
  REFERRAL_SOURCE_OPTIONS,
  SOCIAL_MEDIA_OPTIONS,
  requiresReferralMember,
} from '../constants/registrationOptions';
import type { RegistrationFormValues } from '../types/registration';
import type { SelectOption } from '../../../utils/regionOptions';

export interface RegistrationReferralFieldsProps {
  values: Pick<
    RegistrationFormValues,
    'referralSource' | 'referralId' | 'socialMedia' | 'socialMediaHandle'
  >;
  errors?: Partial<
    Record<'referralSource' | 'referralId' | 'socialMedia' | 'socialMediaHandle', string>
  >;
  onChange: <K extends keyof RegistrationFormValues>(field: K, value: RegistrationFormValues[K]) => void;
  disabled?: boolean;
  showSocialFields?: boolean;
}

export function RegistrationReferralFields({
  values,
  errors = {},
  onChange,
  disabled = false,
  showSocialFields = true,
}: RegistrationReferralFieldsProps) {
  const [sellerOptions, setSellerOptions] = useState<SelectOption[]>([]);
  const [buyerOptions, setBuyerOptions] = useState<SelectOption[]>([]);

  const needsReferralMember = requiresReferralMember(values.referralSource);

  useEffect(() => {
    if (values.referralSource !== 'referred_by_seller') {
      return;
    }

    let cancelled = false;

    void (async () => {
      const options = await fetchSellerReferralOptions();
      if (!cancelled) {
        setSellerOptions(options);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [values.referralSource]);

  useEffect(() => {
    if (values.referralSource !== 'referred_by_buyer') {
      return;
    }

    let cancelled = false;

    void (async () => {
      const options = await fetchBuyerReferralOptions();
      if (!cancelled) {
        setBuyerOptions(options);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [values.referralSource]);

  const referralMemberOptions = useMemo(() => {
    if (values.referralSource === 'referred_by_seller') {
      return sellerOptions;
    }

    if (values.referralSource === 'referred_by_buyer') {
      return buyerOptions;
    }

    return [];
  }, [buyerOptions, sellerOptions, values.referralSource]);

  const referralMemberLabel =
    values.referralSource === 'referred_by_seller'
      ? 'Referred by seller *'
      : 'Referred by buyer *';

  return (
    <View style={styles.container}>
      <SelectField
        label="How did you hear about us? *"
        value={values.referralSource}
        options={REFERRAL_SOURCE_OPTIONS}
        onChange={(next) => {
          onChange('referralSource', next);
          onChange('referralId', '');
        }}
        placeholder="Select an option"
        error={errors.referralSource}
        disabled={disabled}
        modalTitle="How did you hear about us?"
      />

      {needsReferralMember ? (
        <SelectField
          label={referralMemberLabel}
          value={values.referralId}
          options={referralMemberOptions}
          onChange={(next) => onChange('referralId', next)}
          placeholder={
            values.referralSource === 'referred_by_seller'
              ? 'Select a seller'
              : 'Select a buyer'
          }
          error={errors.referralId}
          disabled={disabled || referralMemberOptions.length === 0}
          modalTitle={referralMemberLabel}
        />
      ) : null}

      {showSocialFields ? (
        <>
          <SelectField
            label="Social media"
            value={values.socialMedia}
            options={SOCIAL_MEDIA_OPTIONS}
            onChange={(next) => onChange('socialMedia', next)}
            placeholder="Select social media"
            error={errors.socialMedia}
            disabled={disabled}
            modalTitle="Social media"
          />
          <AppInput
            label="Social media handle"
            value={values.socialMediaHandle}
            onChangeText={(next) => onChange('socialMediaHandle', next)}
            error={errors.socialMediaHandle}
            autoCapitalize="none"
            editable={!disabled}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
