import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { CountryStateFields, SelectField } from '../../../components/forms';
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

export function SellerSetupSectionScreen({ route, navigation }: Props) {
  const { section } = route.params;
  const insets = useSafeAreaInsets();
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
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading section...
        </AppText>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.centeredState}>
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
            <AppInput label="First name *" value={form.firstName} onChangeText={(v) => updateField('firstName', v)} error={fieldErrors.firstName} autoCapitalize="words" />
            <AppInput label="Last name *" value={form.lastName} onChangeText={(v) => updateField('lastName', v)} error={fieldErrors.lastName} autoCapitalize="words" />
            <AppInput label="Email *" value={form.email} onChangeText={(v) => updateField('email', v)} error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" />
            <AccountGenderSelector value={form.gender} onChange={(v) => updateField('gender', v)} error={fieldErrors.gender} />
            <AppInput label="Date of birth *" value={form.dob} onChangeText={(v) => updateField('dob', v)} error={fieldErrors.dob} placeholder="YYYY-MM-DD" />
            <AppInput label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
            <AppInput label="Web3 wallet" value={form.web3address} onChangeText={(v) => updateField('web3address', v)} autoCapitalize="none" />
          </>
        );
      }
      case 'address': {
        const form = values as SellerAddressFormValues;
        return (
          <>
            <CountryStateFields
              value={sellerAddressSelectionFromForm(form)}
              onChange={handleAddressRegionChange}
              countryError={fieldErrors.country}
              stateError={fieldErrors.state}
              required
            />
            <AppInput
              label="Street address *"
              value={form.streetAddress}
              onChangeText={(v) => updateField('streetAddress', v)}
              error={fieldErrors.streetAddress}
            />
            <AppInput
              label="City *"
              value={form.city}
              onChangeText={(v) => updateField('city', v)}
              error={fieldErrors.city}
            />
            <AppInput
              label="Postal / ZIP code *"
              value={form.ZipCode}
              onChangeText={(v) => updateField('ZipCode', v)}
              error={fieldErrors.ZipCode}
            />
          </>
        );
      }
      case 'sellerDetails': {
        const form = values as SellerDetailsFormValues;
        return (
          <>
            <SellerSetupImageField
              label="Profile image"
              kind="profile"
              imageUrl={form.userProfile}
              isUploading={isUploading}
              error={uploadError}
              onPick={handlePickImage}
            />
            <SellerSetupImageField
              label="Store banner"
              kind="banner"
              imageUrl={form.storeBanner}
              isUploading={isUploading}
              error={uploadError}
              onPick={handlePickImage}
            />
            <SellerSetupImageField
              label="Store logo"
              kind="logo"
              imageUrl={form.storeLogo}
              isUploading={isUploading}
              error={uploadError}
              onPick={handlePickImage}
            />
            <AppInput label="Store title" value={form.storeTitle} onChangeText={(v) => updateField('storeTitle', v)} />
            <AppInput label="Store description *" value={form.storeDesc} onChangeText={(v) => updateField('storeDesc', v)} error={fieldErrors.storeDesc} multiline numberOfLines={4} />
            <AppInput label="Twitter URL" value={form.twitter} onChangeText={(v) => updateField('twitter', v)} autoCapitalize="none" />
            <AppInput label="Facebook URL" value={form.facebook} onChangeText={(v) => updateField('facebook', v)} autoCapitalize="none" />
            <AppInput label="Instagram URL" value={form.instagram} onChangeText={(v) => updateField('instagram', v)} autoCapitalize="none" />
            <AppInput label="Tax / VAT number" value={form.taxVatNumber} onChangeText={(v) => updateField('taxVatNumber', v)} error={fieldErrors.taxVatNumber} keyboardType="number-pad" />
            <AppInput label="Product gallery URL" value={form.productGallery} onChangeText={(v) => updateField('productGallery', v)} autoCapitalize="none" />
          </>
        );
      }
      case 'paymentInfo': {
        const form = values as PaymentInfoFormValues;
        return (
          <>
            <AppInput label="Account holder name *" value={form.accountHolderName} onChangeText={(v) => updateField('accountHolderName', v)} error={fieldErrors.accountHolderName} />
            <AppInput label="Account number *" value={form.accountNumber} onChangeText={(v) => updateField('accountNumber', v)} error={fieldErrors.accountNumber} keyboardType="number-pad" />
            <AppInput label="Bank name" value={form.bankName} onChangeText={(v) => updateField('bankName', v)} />
            <AppInput label="SWIFT code" value={form.swiftCode} onChangeText={(v) => updateField('swiftCode', v)} error={fieldErrors.swiftCode} autoCapitalize="characters" />
            <AppInput label="IBAN" value={form.ibanNumber} onChangeText={(v) => updateField('ibanNumber', v)} error={fieldErrors.ibanNumber} autoCapitalize="characters" />
            <AppInput label="Web3 wallet" value={form.web3address} onChangeText={(v) => updateField('web3address', v)} autoCapitalize="none" />
          </>
        );
      }
      case 'sellerPolicies': {
        const form = values as SellerPoliciesFormValues;
        return (
          <>
            <PolicyToggle label="Accept cancellation policy *" value={form.cancellationPolicy} onChange={(v) => updateField('cancellationPolicy', v)} error={fieldErrors.cancellationPolicy} />
            <AppInput label="Cancellation policy time" value={form.cancellationPolicyTime} onChangeText={(v) => updateField('cancellationPolicyTime', v)} />
            <PolicyToggle label="Accept return policy *" value={form.returnPolicy} onChange={(v) => updateField('returnPolicy', v)} error={fieldErrors.returnPolicy} />
            <AppInput label="Return policy details" value={form.returnPolicyDetails} onChangeText={(v) => updateField('returnPolicyDetails', v)} multiline numberOfLines={3} />
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
          </>
        );
      }
      case 'currency': {
        const form = values as CurrencyFormValues;
        return (
          <>
            <SelectField
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard variant="muted">
          <AppText variant="bodyMedium" style={styles.sectionTitle}>
            {getSectionTitle(section)}
          </AppText>
          <View style={styles.form}>{renderForm()}</View>
        </AppCard>

        {saveError ? <ErrorState message={saveError} style={styles.banner} /> : null}
        {saveSuccessMessage ? (
          <AppCard variant="flat" style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {saveSuccessMessage}
            </AppText>
          </AppCard>
        ) : null}

        <AppButton label={isSaving ? 'Saving...' : 'Save section'} loading={isSaving} onPress={() => void handleSave()} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  sectionTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md },
  sectionCopy: { lineHeight: 20, marginBottom: spacing.sm },
  form: { gap: spacing.md },
  banner: { alignSelf: 'stretch', marginHorizontal: 0 },
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
