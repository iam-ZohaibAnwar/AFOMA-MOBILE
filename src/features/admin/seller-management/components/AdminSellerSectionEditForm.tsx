import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { CountryStateFields, SelectField } from '../../../../components/forms';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { createCountryStateSelection } from '../../../../utils/regionOptions';
import { SellerPolicyFaqEditor } from '../../../seller/components/SellerPolicyFaqEditor';
import { SellerSetupImageField } from '../../../seller/components/SellerSetupImageField';
import type { SellerSetupImageKind } from '../../../seller/hooks/useSellerSetupImageUpload';
import { spacing } from '../../../../design-system';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../types/adminSellerManagement';
import type {
  AdminSellerAddressFormValues,
  AdminSellerPaymentFormValues,
  AdminSellerPoliciesFormValues,
  AdminSellerSectionFormValues,
  AdminSellerShopDetailsFormValues,
} from '../types/adminSellerSections';
import {
  ADMIN_CANCELLATION_TIME_OPTIONS,
  ADMIN_RETURN_POLICY_OPTIONS,
} from '../utils/adminSellerSectionForms';

export type AdminSellerSectionEditFormProps = {
  fieldErrors: Record<string, string>;
  seller?: AdminSellerListItem | null;
  isUploading: boolean;
  uploadError: string | null;
  onFieldChange: (key: string, value: unknown) => void;
  onAddressChange: (selection: {
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
  }) => void;
  onPickImage: (kind: SellerSetupImageKind) => Promise<string | null>;
} & (
  | { sectionId: 'address'; values: AdminSellerAddressFormValues }
  | { sectionId: 'shop-details'; values: AdminSellerShopDetailsFormValues }
  | { sectionId: 'payment-information'; values: AdminSellerPaymentFormValues }
  | { sectionId: 'shop-policies'; values: AdminSellerPoliciesFormValues }
);

function PolicyToggle({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  error?: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <AppText variant="bodyMedium">{label}</AppText>
        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export function AdminSellerSectionEditForm({
  sectionId,
  values,
  fieldErrors,
  seller,
  isUploading,
  uploadError,
  onFieldChange,
  onAddressChange,
  onPickImage,
}: AdminSellerSectionEditFormProps) {
  const [faqDraftQuestion, setFaqDraftQuestion] = useState('');
  const [faqDraftAnswer, setFaqDraftAnswer] = useState('');
  const [faqError, setFaqError] = useState<string | null>(null);

  switch (sectionId) {
    case 'address': {
      const form = values;
      return (
        <View style={styles.form}>
          <CountryStateFields
            value={createCountryStateSelection(form.country, form.state, {
              countryCode: form.countryCode,
              stateCode: form.stateCode,
            })}
            onChange={(selection) =>
              onAddressChange({
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
            label="City *"
            value={form.city}
            onChangeText={(value) => onFieldChange('city', value)}
            error={fieldErrors.city}
          />
          <AppInput
            label="Zip / postal code *"
            value={form.zipCode}
            onChangeText={(value) => onFieldChange('zipCode', value)}
            error={fieldErrors.zipCode}
          />
          <AppInput
            label="Street address *"
            value={form.streetAddress}
            onChangeText={(value) => onFieldChange('streetAddress', value)}
            error={fieldErrors.streetAddress}
            multiline
            numberOfLines={2}
          />
        </View>
      );
    }
    case 'shop-details': {
      const form = values;

      const handleImagePick = async (kind: SellerSetupImageKind) => {
        const imageUrl = await onPickImage(kind);
        if (!imageUrl) return;
        if (kind === 'profile') onFieldChange('userProfile', imageUrl);
        if (kind === 'banner') onFieldChange('storeBanner', imageUrl);
        if (kind === 'logo') onFieldChange('storeLogo', imageUrl);
      };

      return (
        <View style={styles.form}>
          <SellerSetupImageField
            label="Profile image"
            kind="profile"
            imageUrl={form.userProfile || seller?.userProfile}
            isUploading={isUploading}
            error={uploadError}
            onPick={handleImagePick}
          />
          <SellerSetupImageField
            label="Store banner"
            kind="banner"
            imageUrl={form.storeBanner || seller?.storeBanner}
            isUploading={isUploading}
            error={uploadError}
            onPick={handleImagePick}
          />
          <SellerSetupImageField
            label="Store logo"
            kind="logo"
            imageUrl={form.storeLogo || seller?.storeLogo}
            isUploading={isUploading}
            error={uploadError}
            onPick={handleImagePick}
          />
          <AppInput
            label="Shop title"
            value={form.storeTitle}
            onChangeText={(value) => onFieldChange('storeTitle', value)}
          />
          <AppInput
            label="Shop description"
            value={form.storeDesc}
            onChangeText={(value) => onFieldChange('storeDesc', value)}
            multiline
            numberOfLines={4}
          />
          <AppInput
            label="Twitter URL"
            value={form.twitter}
            onChangeText={(value) => onFieldChange('twitter', value)}
            autoCapitalize="none"
          />
          <AppInput
            label="Facebook URL"
            value={form.facebook}
            onChangeText={(value) => onFieldChange('facebook', value)}
            autoCapitalize="none"
          />
          <AppInput
            label="Instagram URL"
            value={form.instagram}
            onChangeText={(value) => onFieldChange('instagram', value)}
            autoCapitalize="none"
          />
          <AppInput
            label="Tax / VAT number"
            value={form.taxVatNumber}
            onChangeText={(value) => onFieldChange('taxVatNumber', value)}
            error={fieldErrors.taxVatNumber}
            keyboardType="number-pad"
          />
          <AppInput
            label="Product gallery URL"
            value={form.productGallery}
            onChangeText={(value) => onFieldChange('productGallery', value)}
            autoCapitalize="none"
          />
        </View>
      );
    }
    case 'payment-information': {
      const form = values;
      return (
        <View style={styles.form}>
          <AppInput
            label="Account holder name *"
            value={form.accountHolderName}
            onChangeText={(value) => onFieldChange('accountHolderName', value)}
            error={fieldErrors.accountHolderName}
          />
          <AppInput
            label="Account number *"
            value={form.accountNumber}
            onChangeText={(value) => onFieldChange('accountNumber', value)}
            error={fieldErrors.accountNumber}
            keyboardType="number-pad"
          />
          <AppInput
            label="Bank name"
            value={form.bankName}
            onChangeText={(value) => onFieldChange('bankName', value)}
          />
          <AppInput
            label="SWIFT code"
            value={form.swiftCode}
            onChangeText={(value) => onFieldChange('swiftCode', value)}
            error={fieldErrors.swiftCode}
            autoCapitalize="characters"
          />
          <AppInput
            label="IBAN"
            value={form.ibanNumber}
            onChangeText={(value) => onFieldChange('ibanNumber', value)}
            error={fieldErrors.ibanNumber}
            autoCapitalize="characters"
          />
          <AppInput
            label="Web3 wallet"
            value={form.web3address}
            onChangeText={(value) => onFieldChange('web3address', value)}
            autoCapitalize="none"
          />
        </View>
      );
    }
    case 'shop-policies': {
      const form = values;

      const handleAddFaq = () => {
        if (!faqDraftQuestion.trim() || !faqDraftAnswer.trim()) {
          setFaqError('Both question and answer are required.');
          return;
        }

        setFaqError(null);
        onFieldChange('faqList', [
          ...form.faqList,
          { question: faqDraftQuestion.trim(), answer: faqDraftAnswer.trim() },
        ]);
        setFaqDraftQuestion('');
        setFaqDraftAnswer('');
      };

      const handleRemoveFaq = (index: number) => {
        onFieldChange(
          'faqList',
          form.faqList.filter((_, itemIndex) => itemIndex !== index),
        );
      };

      return (
        <View style={styles.form}>
          <PolicyToggle
            label="Cancellation policy"
            value={form.cancellationPolicy}
            onChange={(value) => onFieldChange('cancellationPolicy', value)}
          />
          {form.cancellationPolicy ? (
            <SelectField
              label="Cancellation window *"
              value={form.cancellationPolicyTime}
              options={ADMIN_CANCELLATION_TIME_OPTIONS}
              onChange={(value) => onFieldChange('cancellationPolicyTime', value)}
              error={fieldErrors.cancellationPolicyTime}
              modalTitle="Cancellation window"
            />
          ) : null}
          <PolicyToggle
            label="Return policy"
            value={form.returnPolicy}
            onChange={(value) => onFieldChange('returnPolicy', value)}
          />
          {form.returnPolicy ? (
            <SelectField
              label="Return policy details *"
              value={form.returnPolicyDetails}
              options={ADMIN_RETURN_POLICY_OPTIONS}
              onChange={(value) => onFieldChange('returnPolicyDetails', value)}
              error={fieldErrors.returnPolicyDetails}
              modalTitle="Return policy"
            />
          ) : null}
          <SellerPolicyFaqEditor
            faqList={form.faqList}
            draftQuestion={faqDraftQuestion}
            draftAnswer={faqDraftAnswer}
            onDraftQuestionChange={setFaqDraftQuestion}
            onDraftAnswerChange={setFaqDraftAnswer}
            onAdd={handleAddFaq}
            onRemove={handleRemoveFaq}
            error={faqError}
          />
        </View>
      );
    }
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
