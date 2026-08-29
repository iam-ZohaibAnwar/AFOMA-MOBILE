import { useCallback, useEffect, useState } from 'react';
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

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { ProductMediaPicker } from '../../../seller/products/components/ProductMediaPicker';
import { useSellerProductCategories } from '../../../seller/products/hooks/useSellerProductCategories';
import {
  DOWNLOADABLE_PRODUCT_MIN_IMAGES,
  DOWNLOADABLE_WIZARD_STEPS,
} from '../../../seller/products/utils/productTypeConstants';
import { SELLER_INVENTORY_OPTIONS } from '../../../seller/products/utils/standardProductConstants';
import { AdminSellerPickerField } from '../components/AdminSellerPickerField';
import { useAdminDownloadableProductWizard } from '../hooks/useAdminDownloadableProductWizard';
import { useAdminSellerPicker } from '../hooks/useAdminSellerPicker';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDownloadableProduct'>;

const RETURN_TO = authReturnTo.adminProductManagement();

export function AdminDownloadableProductScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const routeSellerId = route.params?.sellerId;
  const initialProduct = route.params?.initialProduct;
  const isEditMode = Boolean(productId);
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [sellerId, setSellerId] = useState(routeSellerId ?? '');
  const wizard = useAdminDownloadableProductWizard(sellerId, productId, initialProduct);
  const sellerPicker = useAdminSellerPicker(isAuthorized);
  const categories = useSellerProductCategories();
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => {
    if (routeSellerId) {
      setSellerId(routeSellerId);
    }
  }, [routeSellerId]);

  useEffect(() => {
    if (wizard.resolvedSellerId) {
      setSellerId(wizard.resolvedSellerId);
    }
  }, [wizard.resolvedSellerId]);

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

  const handleSave = useCallback(async () => {
    await wizard.saveProduct();
  }, [wizard]);

  const handleDone = useCallback(async () => {
    const savedId = wizard.savedProductId ?? (await wizard.saveProduct());
    if (savedId) {
      navigation.goBack();
    }
  }, [navigation, wizard]);

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (wizard.isLoadingProduct && !initialProduct) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading product...
        </AppText>
      </View>
    );
  }

  if (wizard.loadProductError && !initialProduct) {
    return (
      <View style={styles.centeredState}>
        <ErrorState
          message={wizard.loadProductError}
          onAction={() => void wizard.reloadProduct()}
        />
      </View>
    );
  }

  const renderCategories = () => (
    <View style={styles.stepContent}>
      {categories.isLoadingParents ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
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
      )}
      {wizard.values.categoryId ? (
        categories.isLoadingSubCategories ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
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
        )
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
      {categories.error ? (
        <ErrorState message={categories.error} style={styles.inlineError} />
      ) : null}
    </View>
  );

  const renderStep = () => {
    switch (wizard.currentStep.id) {
      case 'basic':
        return (
          <View style={styles.stepContent}>
            <AdminSellerPickerField
              value={sellerId}
              options={sellerPicker.options}
              onChange={setSellerId}
              error={wizard.fieldErrors.sellerId}
              isLoading={sellerPicker.isLoading}
              loadError={sellerPicker.error}
              onRetry={() => void sellerPicker.reload()}
              disabled={isEditMode && Boolean(wizard.resolvedSellerId)}
            />
            <AppInput tone="surface"
              label="Product name *"
              value={wizard.values.productName}
              onChangeText={(text) => wizard.updateField('productName', text)}
              maxLength={120}
              error={wizard.fieldErrors.productName}
            />
            <AppInput tone="surface"
              label="Description *"
              value={wizard.values.description}
              onChangeText={(text) => wizard.updateField('description', text)}
              multiline
              numberOfLines={5}
              style={styles.textArea}
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
            <AppInput tone="surface"
              label="Meta title"
              value={wizard.values.metaTitle}
              onChangeText={(text) => wizard.updateField('metaTitle', text)}
            />
            <AppInput tone="surface"
              label="Meta keywords"
              value={wizard.values.metaKeywords}
              onChangeText={(text) => wizard.updateField('metaKeywords', text)}
            />
            <AppInput tone="surface"
              label="Meta description"
              value={wizard.values.metaDesc}
              onChangeText={(text) => wizard.updateField('metaDesc', text)}
              multiline
              numberOfLines={4}
              style={styles.textArea}
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
                {wizard.savedProductId ? (
                  <AppText variant="caption" color="textMuted">
                    Product ID: {wizard.savedProductId}
                  </AppText>
                ) : null}
              </AppCard>
            ) : null}
            {wizard.saveError ? (
              <ErrorState message={wizard.saveError} onAction={() => wizard.setSaveError(null)} />
            ) : null}
            <AppButton
              label={wizard.isSaving ? 'Saving...' : wizard.savedProductId ? 'Save again' : 'Save product'}
              onPress={() => void handleSave()}
              loading={wizard.isSaving}
              fullWidth
            />
            <AppButton
              label={wizard.isSaving ? 'Saving...' : 'Done'}
              onPress={() => void handleDone()}
              loading={wizard.isSaving}
              disabled={wizard.isSaving}
              fullWidth
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <AppText variant="caption" color="textMuted" style={styles.stepMeta}>
            Step {wizard.stepIndex + 1} of {DOWNLOADABLE_WIZARD_STEPS.length}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  progressRow: { flexDirection: 'row', gap: spacing.xs },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  progressDotActive: { backgroundColor: colors.primary },
  stepTitle: { fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  stepMeta: { marginBottom: spacing.lg },
  stepContent: { gap: spacing.md },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  footerActions: { flexDirection: 'row', gap: spacing.md },
  footerButton: { flex: 1 },
  inlineError: { marginHorizontal: 0 },
});
