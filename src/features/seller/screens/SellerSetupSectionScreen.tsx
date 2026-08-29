import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import {
  CountryStateFields,
  DateField,
  KeyboardAwareFormScreen,
  SelectField,
  useKeyboardAwareForm,
} from '../../../components/forms';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { AccountGenderSelector } from '../../account/components/AccountGenderSelector';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerPolicyFaqEditor } from '../components/SellerPolicyFaqEditor';
import { SellerSetupImageField } from '../components/SellerSetupImageField';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { useSellerSetupImageUpload } from '../hooks/useSellerSetupImageUpload';
import { useSellerSetupSectionSave } from '../hooks/useSellerSetupSectionSave';
import {
  CURRENCY_OPTIONS,
  getSectionTitle,
  sellerAddressSelectionFromForm,
  validateBasicInfoForm,
  validateCurrencyForm,
  validatePaymentInfoForm,
  validateSellerAddressForm,
  validateSellerDetailsForm,
  validateSellerPoliciesForm,
  type BasicInfoFormValues,
  type CurrencyFormValues,
  type PaymentInfoFormValues,
  type SellerAddressFormValues,
  type SellerDetailsFormValues,
  type SellerPolicyFaqEntry,
  type SellerPoliciesFormValues,
} from '../utils/sellerSetupForms';
import type { CountryStateSelection } from '../../../utils/regionOptions';
import type { SellerSetupImageKind } from '../hooks/useSellerSetupImageUpload';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerSetupSection'>;

const SECTION_RETURN_TO = authReturnTo.sellerSetup();
/** Web `bg-orange-100` — all seller setup inputs, selects, and policy fields. */
const SELLER_SETUP_FIELD_TONE = 'surface' as const;

export function SellerSetupSectionScreen({ route, navigation }: Props) {
  const { section } = route.params;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const formControls = useKeyboardAwareForm(scrollRef);
  const onFieldFocus = formControls.onFieldFocus;
  const { isAuthorized, sellerId } = useRequireSeller(SECTION_RETURN_TO);
  const { profile, isLoading, error, reload, applyProfileUpdate } = useSellerProfile(
    isAuthorized ? sellerId : undefined,
  );
  const { initialValues, isSaving, saveError, saveSuccessMessage, saveSection, setSaveError } =
    useSellerSetupSectionSave(sellerId, section, profile, applyProfileUpdate);
  const { isUploading, uploadError, pickAndUpload, clearUploadError } = useSellerSetupImageUpload();

  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [faqDraftQuestion, setFaqDraftQuestion] = useState('');
  const [faqDraftAnswer, setFaqDraftAnswer] = useState('');
  const [faqError, setFaqError] = useState<string | null>(null);

  useEffect(() => {
    if (section === 'domesticShipping' || section === 'internationalShipping') {
      navigation.replace('SellerShippingConfig');
    }
  }, [navigation, section]);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  if (section === 'domesticShipping' || section === 'internationalShipping') {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !profile) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading section...
        </AppText>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  const handleSave = async () => {
    let validationErrors: Record<string, string> = {};

    switch (section) {
      case 'basicInfo':
        validationErrors = validateBasicInfoForm(values as BasicInfoFormValues);
        break;
      case 'address':
        validationErrors = validateSellerAddressForm(values as SellerAddressFormValues);
        break;
      case 'sellerDetails':
        validationErrors = validateSellerDetailsForm(values as SellerDetailsFormValues);
        break;
      case 'paymentInfo':
        validationErrors = validatePaymentInfoForm(values as PaymentInfoFormValues);
        break;
      case 'sellerPolicies':
        validationErrors = validateSellerPoliciesForm(values as SellerPoliciesFormValues);
        break;
      case 'currency':
        validationErrors = validateCurrencyForm(values as CurrencyFormValues);
        break;
      default:
        break;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSaveError('Please fix the highlighted fields.');
      return;
    }

    setFieldErrors({});
    const saved = await saveSection(
      values as
        | BasicInfoFormValues
        | SellerAddressFormValues
        | SellerDetailsFormValues
        | PaymentInfoFormValues
        | SellerPoliciesFormValues
        | CurrencyFormValues,
    );

    if (saved) {
      navigation.goBack();
    }
  };

  const updateField = (field: string, nextValue: string | boolean | SellerPolicyFaqEntry[]) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaveError(null);
  };

  const handleAddressRegionChange = (selection: CountryStateSelection) => {
    setValues((current) => ({
      ...current,
      country: selection.country,
      countryCode: selection.countryCode,
      state: selection.state,
      stateCode: selection.stateCode,
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.country;
      delete next.state;
      return next;
    });
    setSaveError(null);
  };

  const handlePickImage = async (kind: SellerSetupImageKind) => {
    clearUploadError();
    const imageUrl = await pickAndUpload(kind);
    if (!imageUrl) {
      return;
    }

    if (kind === 'profile') {
      updateField('userProfile', imageUrl);
      return;
    }

    if (kind === 'banner') {
      updateField('storeBanner', imageUrl);
      return;
    }

    updateField('storeLogo', imageUrl);
  };

  const handleRemoveImage = (kind: SellerSetupImageKind) => {
    clearUploadError();

    if (kind === 'profile') {
      updateField('userProfile', '');
      return;
    }

    if (kind === 'banner') {
      updateField('storeBanner', '');
      return;
    }

    updateField('storeLogo', '');
  };

  const handleAddFaq = () => {
    const form = values as SellerPoliciesFormValues;
    if (!faqDraftQuestion.trim() || !faqDraftAnswer.trim()) {
      setFaqError('Both question and answer are required.');
      return;
    }

    updateField('faqList', [
      ...form.faqList,
      { question: faqDraftQuestion.trim(), answer: faqDraftAnswer.trim() },
    ]);
    setFaqDraftQuestion('');
    setFaqDraftAnswer('');
    setFaqError(null);
  };

  const handleRemoveFaq = (index: number) => {
    const form = values as SellerPoliciesFormValues;
    updateField(
      'faqList',
      form.faqList.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const renderForm = () => {
    switch (section) {
      case 'basicInfo': {
        const form = values as BasicInfoFormValues;
        return (
          <>
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="First name *" value={form.firstName} onChangeText={(v) => updateField('firstName', v)} onFocus={onFieldFocus} error={fieldErrors.firstName} autoCapitalize="words" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Last name *" value={form.lastName} onChangeText={(v) => updateField('lastName', v)} onFocus={onFieldFocus} error={fieldErrors.lastName} autoCapitalize="words" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Email *" value={form.email} onChangeText={(v) => updateField('email', v)} onFocus={onFieldFocus} error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" />
            <AccountGenderSelector tone={SELLER_SETUP_FIELD_TONE} value={form.gender} onChange={(v) => updateField('gender', v)} error={fieldErrors.gender} />
            <DateField tone={SELLER_SETUP_FIELD_TONE} label="Date of birth *" value={form.dob} onChange={(v) => updateField('dob', v)} error={fieldErrors.dob} placeholder="Pick a date" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} onFocus={onFieldFocus} keyboardType="phone-pad" />
          </>
        );
      }
      case 'address': {
        const form = values as SellerAddressFormValues;
        return (
          <>
            <CountryStateFields
              tone={SELLER_SETUP_FIELD_TONE}
              value={sellerAddressSelectionFromForm(form)}
              onChange={handleAddressRegionChange}
              countryError={fieldErrors.country}
              stateError={fieldErrors.state}
              required
            />
            <AppInput
              tone={SELLER_SETUP_FIELD_TONE}
              label="Street address *"
              value={form.streetAddress}
              onChangeText={(v) => updateField('streetAddress', v)}
              onFocus={onFieldFocus}
              error={fieldErrors.streetAddress}
            />
            <AppInput
              tone={SELLER_SETUP_FIELD_TONE}
              label="City *"
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
              onFocus={onFieldFocus}
              error={fieldErrors.city}
            />
            <AppInput
              tone={SELLER_SETUP_FIELD_TONE}
              label="Postal / ZIP code *"
              value={form.ZipCode}
              onChangeText={(v) => updateField('ZipCode', v)}
              onFocus={onFieldFocus}
              error={fieldErrors.ZipCode}
            />
          </>
        );
      }
      case 'sellerDetails': {
        const form = values as SellerDetailsFormValues;
        return (
          <>
            <View style={styles.imageSection}>
              <AppText variant="bodyMedium" style={styles.subsectionTitle}>
                Shop imagery
              </AppText>
              <AppText variant="caption" color="textSecondary" style={styles.sectionCopy}>
                Profile, banner, and logo appear on your public shop page.
              </AppText>

              <SellerSetupImageField
                label="Profile image"
                kind="profile"
                imageUrl={form.userProfile}
                isUploading={isUploading}
                error={uploadError}
                onPick={handlePickImage}
                onRemove={handleRemoveImage}
              />
              <SellerSetupImageField
                label="Store banner"
                kind="banner"
                imageUrl={form.storeBanner}
                isUploading={isUploading}
                error={uploadError}
                onPick={handlePickImage}
                onRemove={handleRemoveImage}
              />
              <SellerSetupImageField
                label="Store logo"
                kind="logo"
                imageUrl={form.storeLogo}
                isUploading={isUploading}
                error={uploadError}
                onPick={handlePickImage}
                onRemove={handleRemoveImage}
              />
            </View>

            <AppText variant="bodyMedium" style={styles.subsectionTitle}>
              Shop details
            </AppText>
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Store title" value={form.storeTitle} onChangeText={(v) => updateField('storeTitle', v)} onFocus={onFieldFocus} placeholder="Enter shop title" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Store description *" value={form.storeDesc} onChangeText={(v) => updateField('storeDesc', v)} onFocus={onFieldFocus} error={fieldErrors.storeDesc} multiline numberOfLines={4} placeholder="Describe your company" style={styles.textArea} />
            <AppText variant="caption" color="textSecondary">
              Maximum 1000 characters allowed.
            </AppText>
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Twitter URL" value={form.twitter} onChangeText={(v) => updateField('twitter', v)} onFocus={onFieldFocus} autoCapitalize="none" placeholder="Enter Twitter profile URL" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Facebook URL" value={form.facebook} onChangeText={(v) => updateField('facebook', v)} onFocus={onFieldFocus} autoCapitalize="none" placeholder="Enter Facebook profile URL" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Instagram URL" value={form.instagram} onChangeText={(v) => updateField('instagram', v)} onFocus={onFieldFocus} autoCapitalize="none" placeholder="Enter Instagram profile URL" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Tax / VAT number" value={form.taxVatNumber} onChangeText={(v) => updateField('taxVatNumber', v)} onFocus={onFieldFocus} error={fieldErrors.taxVatNumber} keyboardType="number-pad" placeholder="Enter tax or VAT number" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Product gallery URL" value={form.productGallery} onChangeText={(v) => updateField('productGallery', v)} onFocus={onFieldFocus} autoCapitalize="none" placeholder="Enter URL" />
          </>
        );
      }
      case 'paymentInfo': {
        const form = values as PaymentInfoFormValues;
        return (
          <>
            <AppText variant="bodyMedium" style={styles.subsectionTitle}>
              Bank details
            </AppText>
            <AppText variant="caption" color="textSecondary" style={styles.sectionCopy}>
              Payouts are sent to this bank account after orders are completed.
            </AppText>
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Account holder name *" value={form.accountHolderName} onChangeText={(v) => updateField('accountHolderName', v)} onFocus={onFieldFocus} error={fieldErrors.accountHolderName} autoCapitalize="words" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Account number *" value={form.accountNumber} onChangeText={(v) => updateField('accountNumber', v)} onFocus={onFieldFocus} error={fieldErrors.accountNumber} keyboardType="number-pad" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Bank name" value={form.bankName} onChangeText={(v) => updateField('bankName', v)} onFocus={onFieldFocus} />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="SWIFT code" value={form.swiftCode} onChangeText={(v) => updateField('swiftCode', v)} onFocus={onFieldFocus} error={fieldErrors.swiftCode} autoCapitalize="characters" />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="IBAN" value={form.ibanNumber} onChangeText={(v) => updateField('ibanNumber', v)} onFocus={onFieldFocus} error={fieldErrors.ibanNumber} autoCapitalize="characters" />
          </>
        );
      }
      case 'sellerPolicies': {
        const form = values as SellerPoliciesFormValues;
        return (
          <>
            <PolicyToggle label="Accept cancellation policy *" value={form.cancellationPolicy} onChange={(v) => updateField('cancellationPolicy', v)} error={fieldErrors.cancellationPolicy} />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Cancellation policy time" value={form.cancellationPolicyTime} onChangeText={(v) => updateField('cancellationPolicyTime', v)} onFocus={onFieldFocus} />
            <PolicyToggle label="Accept return policy *" value={form.returnPolicy} onChange={(v) => updateField('returnPolicy', v)} error={fieldErrors.returnPolicy} />
            <AppInput tone={SELLER_SETUP_FIELD_TONE} label="Return policy details" value={form.returnPolicyDetails} onChangeText={(v) => updateField('returnPolicyDetails', v)} onFocus={onFieldFocus} multiline numberOfLines={3} style={styles.textArea} />
            <SellerPolicyFaqEditor
              tone={SELLER_SETUP_FIELD_TONE}
              faqList={form.faqList}
              draftQuestion={faqDraftQuestion}
              draftAnswer={faqDraftAnswer}
              onDraftQuestionChange={setFaqDraftQuestion}
              onDraftAnswerChange={setFaqDraftAnswer}
              onDraftFieldFocus={onFieldFocus}
              onAdd={handleAddFaq}
              onRemove={handleRemoveFaq}
              error={faqError}
            />
          </>
        );
      }
      case 'currency': {
        const form = values as CurrencyFormValues;
        return (
          <>
            <SelectField
              tone={SELLER_SETUP_FIELD_TONE}
              label="Store currency *"
              value={form.currency}
              options={CURRENCY_OPTIONS}
              onChange={(v) => updateField('currency', v)}
              error={fieldErrors.currency}
            />
            <AppText variant="caption" color="textSecondary">
              For full shipping method and rate configuration, use Account → Seller → Shipping.
            </AppText>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <KeyboardAwareFormScreen
      scrollRef={scrollRef}
      formControls={formControls}
      contentContainerStyle={styles.content}
    >
      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {getSectionTitle(section)}
        </AppText>
        <View style={styles.form}>{renderForm()}</View>
      </AppCard>

      {saveError ? <ErrorState message={saveError} style={styles.footerBanner} /> : null}
      {saveSuccessMessage ? (
        <AppCard variant="flat" style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {saveSuccessMessage}
          </AppText>
        </AppCard>
      ) : null}
      <AppButton
        label={isSaving ? 'Saving...' : 'Save section'}
        loading={isSaving}
        onPress={() => void handleSave()}
        fullWidth
      />
    </KeyboardAwareFormScreen>
  );
}

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
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primarySoft, false: colors.borderStrong }} thumbColor={value ? colors.primary : colors.surface} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  sectionTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md },
  subsectionTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  sectionCopy: { lineHeight: 20, marginBottom: spacing.sm },
  form: { gap: spacing.md },
  imageSection: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  footerBanner: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  successBanner: { backgroundColor: colors.successBg, borderColor: colors.successSoft },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  toggleCopy: { flex: 1, gap: 2 },
});
