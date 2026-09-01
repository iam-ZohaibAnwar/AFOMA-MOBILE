import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import {
  KeyboardAwareFormScreen,
  MetaDescriptionInput,
  MetaKeywordsInput,
  MetaTitleInput,
  ProductDescriptionInput,
  ProductNameInput,
  SelectField,
} from '../../../components/forms';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { ProductMediaPicker } from '../products/components/ProductMediaPicker';
import { useDownloadableProductWizard } from '../products/hooks/useDownloadableProductWizard';
import { useSellerProductCategories } from '../products/hooks/useSellerProductCategories';
import { navigateToIncompleteSellerSetup } from '../products/utils/sellerProductCreationNavigation';
import { DOWNLOADABLE_PRODUCT_MIN_IMAGES, DOWNLOADABLE_WIZARD_STEPS } from '../products/utils/productTypeConstants';
import { SELLER_INVENTORY_OPTIONS } from '../products/utils/standardProductConstants';
import { canSellerCreateProducts } from '../utils/sellerProductGate';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerDownloadableProduct'>;

const RETURN_TO = authReturnTo.sellerProductType();

export function SellerDownloadableProductScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const isEditMode = Boolean(productId);
  const { isAuthorized, sellerId } = useRequireSeller(RETURN_TO);
  const { profile, isLoading: isProfileLoading } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const canCreate = canSellerCreateProducts(profile?.profileSetup);
  const wizard = useDownloadableProductWizard(sellerId, productId);
  const categories = useSellerProductCategories();
  const [isAddingImage, setIsAddingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isEditMode || !isAuthorized || isProfileLoading || !profile || canCreate) {
        return;
      }
      navigateToIncompleteSellerSetup(navigation, profile);
    }, [canCreate, isAuthorized, isEditMode, isProfileLoading, navigation, profile]),
  );

  useEffect(() => {
    if (wizard.values.categoryId) {
      void categories.loadSubCategories(wizard.values.categoryId);
    }
  }, [wizard.values.categoryId, categories.loadSubCategories]);

  useEffect(() => {
    if (wizard.values.subCategoryId) {
      void categories.loadChildCategories(wizard.values.subCategoryId);
    }
  }, [wizard.values.subCategoryId, categories.loadChildCategories]);

  const handleSave = async () => {
    const savedId = await wizard.saveProduct();
    if (savedId) {
      wizard.goToStep('review');
    }
  };

  const handleSubmitForReview = async () => {
    const success = await wizard.submitForReview();
    if (success) {
      navigation.navigate('SellerProducts');
    }
  };

  if (!isAuthorized || (!canCreate && !isEditMode) || wizard.isLoadingProduct) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (wizard.loadProductError) {
    return (
      <View style={styles.centeredState}>
        <ErrorState message={wizard.loadProductError} onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const renderCategories = () => (
    <View style={styles.stepContent}>
      <SelectField tone="surface"
        label="Parent category *"
        value={wizard.values.categoryId}
        options={categories.parentOptions}
        onChange={(value) => {
          wizard.updateField('categoryId', value);
          wizard.updateField('subCategoryId', '');
          wizard.updateField('childCategoryId', '');
        }}
        placeholder="Select parent category"
        error={wizard.fieldErrors.categoryId}
        modalTitle="Parent category"
      />
      {wizard.values.categoryId ? (
        <SelectField tone="surface"
          label="Subcategory *"
          value={wizard.values.subCategoryId}
          options={categories.subCategoryOptions}
          onChange={(value) => {
            wizard.updateField('subCategoryId', value);
            wizard.updateField('childCategoryId', '');
          }}
          placeholder="Select subcategory"
          error={wizard.fieldErrors.subCategoryId}
          modalTitle="Subcategory"
        />
      ) : null}
      {wizard.values.subCategoryId && categories.childCategoryOptions.length > 0 ? (
        <SelectField tone="surface"
          label="Child category"
          value={wizard.values.childCategoryId}
          options={categories.childCategoryOptions}
          onChange={(value) => wizard.updateField('childCategoryId', value)}
          placeholder="Optional"
          modalTitle="Child category"
        />
      ) : null}
    </View>
  );

  const renderStep = () => {
    switch (wizard.currentStep.id) {
      case 'basic':
        return (
          <View style={styles.stepContent}>
            <ProductNameInput
              value={wizard.values.productName}
              onChangeText={(text) => wizard.updateField('productName', text)}
              error={wizard.fieldErrors.productName}
            />
            <ProductDescriptionInput
              value={wizard.values.description}
              onChangeText={(text) => wizard.updateField('description', text)}
              error={wizard.fieldErrors.description}
            />
          </View>
        );
      case 'categories':
        return renderCategories();
      case 'images':
        return (
          <ProductMediaPicker
            images={wizard.images}
            minImages={DOWNLOADABLE_PRODUCT_MIN_IMAGES}
            error={wizard.fieldErrors.images}
            onAdd={() => {
              setIsAddingImage(true);
              void wizard.addImageFromPicker().finally(() => setIsAddingImage(false));
            }}
            onRemove={wizard.removeImage}
            onMove={wizard.moveImage}
            onAltTextChange={wizard.updateImageAltText}
            isAdding={isAddingImage}
            imageUploadSheetProps={wizard.imageUploadSheetProps}
          />
        );
      case 'pricing':
        return (
          <View style={styles.stepContent}>
            <SelectField tone="surface"
              label="Inventory *"
              value={wizard.values.inventory}
              options={SELLER_INVENTORY_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onChange={(value) =>
                wizard.updateField('inventory', value as typeof wizard.values.inventory)
              }
              error={wizard.fieldErrors.inventory}
              modalTitle="Inventory"
            />
            <SelectField tone="surface"
              label="Currency"
              value={wizard.values.currency}
              options={wizard.currencyOptions}
              onChange={(value) => wizard.updateField('currency', value)}
              modalTitle="Currency"
            />
            {wizard.values.currency !== 'cad' ? (
              <AppInput tone="surface"
                label={`Price in ${wizard.values.currency.toUpperCase()}`}
                value={wizard.values.currencyPrice}
                onChangeText={(text) => wizard.updateField('currencyPrice', text)}
                keyboardType="decimal-pad"
                error={wizard.fieldErrors.currencyPrice}
              />
            ) : null}
            <AppInput tone="surface"
              label="Price (CAD) *"
              value={wizard.values.price}
              onChangeText={(text) => wizard.updateField('price', text)}
              keyboardType="decimal-pad"
              editable={wizard.values.currency === 'cad'}
              error={wizard.fieldErrors.price}
            />
          </View>
        );
      case 'download':
        return (
          <View style={styles.stepContent}>
            <AppText variant="bodySmall" color="textSecondary">
              Upload the digital file buyers will receive after purchase.
            </AppText>
            <AppButton
              label={
                wizard.downloadFile?.isUploading
                  ? 'Uploading file...'
                  : wizard.downloadFile?.featuredProductUrl
                    ? 'Replace download file'
                    : 'Select download file'
              }
              variant="outline"
              loading={wizard.downloadFile?.isUploading}
              onPress={() => void wizard.pickDownloadFile()}
            />
            {wizard.downloadFile?.fileName ? (
              <AppText variant="bodySmall" color="textSecondary">
                File: {wizard.downloadFile.fileName}
              </AppText>
            ) : null}
            {wizard.downloadFile?.uploadError ? (
              <AppText variant="caption" color="error">
                {wizard.downloadFile.uploadError}
              </AppText>
            ) : null}
            {wizard.fieldErrors.downloadFile ? (
              <AppText variant="caption" color="error">
                {wizard.fieldErrors.downloadFile}
              </AppText>
            ) : null}
          </View>
        );
      case 'additional':
        return (
          <View style={styles.stepContent}>
            <MetaTitleInput
              value={wizard.values.metaTitle}
              onChangeText={(text) => wizard.updateField('metaTitle', text)}
            />
            <MetaKeywordsInput
              value={wizard.values.metaKeywords}
              onChangeText={(text) => wizard.updateField('metaKeywords', text)}
            />
            <MetaDescriptionInput
              value={wizard.values.metaDesc}
              onChangeText={(text) => wizard.updateField('metaDesc', text)}
            />
            <AppInput tone="surface"
              label="Discount (%)"
              value={wizard.values.discountCode}
              onChangeText={(text) => wizard.updateField('discountCode', text)}
              keyboardType="number-pad"
            />
          </View>
        );
      case 'review':
        return (
          <View style={styles.stepContent}>
            {wizard.saveSuccessMessage ? (
              <AppCard variant="muted">
                <AppText variant="bodySmall" color="success">
                  {wizard.saveSuccessMessage}
                </AppText>
              </AppCard>
            ) : null}
            {wizard.saveError ? (
              <ErrorState message={wizard.saveError} onAction={() => wizard.setSaveError(null)} />
            ) : null}
            {wizard.submitError ? (
              <ErrorState message={wizard.submitError} onAction={() => wizard.setSubmitError(null)} />
            ) : null}
            <AppButton
              label={wizard.isSaving ? 'Saving...' : wizard.savedProductId ? 'Save again' : 'Save product'}
              onPress={() => void handleSave()}
              loading={wizard.isSaving}
              fullWidth
            />
            <AppButton
              label={wizard.isSubmitting ? 'Submitting...' : 'Submit for approval'}
              onPress={() => void handleSubmitForReview()}
              loading={wizard.isSubmitting}
              disabled={!wizard.savedProductId || wizard.isSaving || !wizard.canSubmit}
              fullWidth
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAwareFormScreen contentContainerStyle={styles.content}>
        <View style={styles.progressRow}>
          {DOWNLOADABLE_WIZARD_STEPS.map((step, index) => (
            <View
              key={step.id}
              style={[styles.progressDot, index <= wizard.stepIndex && styles.progressDotActive]}
            />
          ))}
        </View>
        <AppCard variant="flat">
          <AppText variant="bodyMedium" style={styles.stepTitle}>
            {wizard.currentStep.title}
          </AppText>
          {renderStep()}
        </AppCard>
        {wizard.currentStep.id !== 'review' ? (
          <View style={styles.footerActions}>
            {!wizard.isFirstStep ? (
              <AppButton label="Back" variant="outline" onPress={wizard.goBack} style={styles.footerButton} />
            ) : null}
            {!wizard.isLastStep ? (
              <AppButton label="Next" onPress={wizard.goNext} style={styles.footerButton} />
            ) : null}
          </View>
        ) : null}
    </KeyboardAwareFormScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  progressRow: { flexDirection: 'row', gap: spacing.xs },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  progressDotActive: { backgroundColor: colors.primary },
  stepTitle: { fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  stepContent: { gap: spacing.md },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  footerActions: { flexDirection: 'row', gap: spacing.md },
  footerButton: { flex: 1 },
});
