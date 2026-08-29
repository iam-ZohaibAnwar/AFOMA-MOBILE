import { useCallback, useEffect, useState } from 'react';
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
import { ProductShippingEstimateTrigger } from '../../../seller/products/components/ProductShippingEstimateTrigger';
import { useSellerProductCategories } from '../../../seller/products/hooks/useSellerProductCategories';
import {
  CUSTOMIZABLE_PRODUCT_MIN_IMAGES,
  CUSTOMIZABLE_WIZARD_STEPS,
} from '../../../seller/products/utils/productTypeConstants';
import { AdminSellerPickerField } from '../components/AdminSellerPickerField';
import { useAdminCustomizableProductWizard } from '../hooks/useAdminCustomizableProductWizard';
import { useAdminSellerPicker } from '../hooks/useAdminSellerPicker';
import { navigateToAdminCustomizableVariations } from '../utils/adminProductWriteNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCustomizableProduct'>;

const RETURN_TO = authReturnTo.adminProductManagement();

export function AdminCustomizableProductScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const routeSellerId = route.params?.sellerId;
  const initialProduct = route.params?.initialProduct;
  const isEditMode = Boolean(productId);
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [sellerId, setSellerId] = useState(routeSellerId ?? '');
  const wizard = useAdminCustomizableProductWizard(sellerId, productId, initialProduct);
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

  const buildVariationsContext = useCallback(
    () => ({
      productName: wizard.values.productName,
      images: wizard.images
        .filter((image) => image.imageUrl)
        .map((image) => ({
          imageUrl: image.imageUrl,
          altText: image.altText,
        })),
    }),
    [wizard.images, wizard.values.productName],
  );

  const handleSaveAndContinue = useCallback(async () => {
    const savedId = await wizard.saveProduct();
    if (savedId) {
      navigateToAdminCustomizableVariations(navigation, savedId, sellerId, buildVariationsContext());
    }
  }, [buildVariationsContext, navigation, sellerId, wizard]);

  const handleOpenVariations = useCallback(() => {
    if (!wizard.savedProductId) {
      return;
    }

    navigateToAdminCustomizableVariations(
      navigation,
      wizard.savedProductId,
      sellerId,
      buildVariationsContext(),
    );
  }, [buildVariationsContext, navigation, sellerId, wizard.savedProductId]);

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
        return (
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
                modalTitle="Child category"
              />
            ) : null}
          </View>
        );
      case 'images':
        return (
          <ProductMediaPicker
            images={wizard.images}
            minImages={CUSTOMIZABLE_PRODUCT_MIN_IMAGES}
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
      case 'shipping':
        return (
          <View style={styles.stepContent}>
            {(['weight', 'length', 'width', 'height', 'dispatchDays'] as const).map((field) => (
              <AppInput tone="surface"
                key={field}
                label={`${field === 'dispatchDays' ? 'Dispatch days' : field.charAt(0).toUpperCase() + field.slice(1)} *`}
                value={wizard.values[field]}
                onChangeText={(text) => wizard.updateField(field, text)}
                keyboardType="decimal-pad"
                error={wizard.fieldErrors[field]}
              />
            ))}
            <ProductShippingEstimateTrigger
              sellerId={sellerId}
              prefill={{
                weight: wizard.values.weight,
                length: wizard.values.length,
                width: wizard.values.width,
                height: wizard.values.height,
                dispatchDays: wizard.values.dispatchDays,
              }}
              price={wizard.values.currencyPrice}
            />
            <View style={styles.switchRow}>
              <AppText variant="bodyMedium">Custom shipping options</AppText>
              <Switch
                value={wizard.values.isCustomShipping}
                onValueChange={(value) => wizard.updateField('isCustomShipping', value)}
              />
            </View>
            {wizard.values.isCustomShipping ? (
              <>
                <View style={styles.switchRow}>
                  <AppText variant="bodyMedium">Free delivery</AppText>
                  <Switch
                    value={wizard.values.freeDelivery}
                    onValueChange={(value) => wizard.updateField('freeDelivery', value)}
                  />
                </View>
                <AppInput tone="surface"
                  label="Handling fee *"
                  value={wizard.values.handlingFee}
                  onChangeText={(text) => wizard.updateField('handlingFee', text)}
                  keyboardType="decimal-pad"
                  error={wizard.fieldErrors.handlingFee}
                />
                <AppInput tone="surface"
                  label="Additional cost"
                  value={wizard.values.additionalCost}
                  onChangeText={(text) => wizard.updateField('additionalCost', text)}
                  keyboardType="decimal-pad"
                  error={wizard.fieldErrors.additionalCost}
                />
              </>
            ) : null}
          </View>
        );
      case 'additional':
        return (
          <View style={styles.stepContent}>
            <SelectField tone="surface"
              label="Currency"
              value={wizard.values.currency}
              options={wizard.currencyOptions}
              onChange={(value) => wizard.updateField('currency', value)}
              modalTitle="Currency"
            />
            <AppInput tone="surface"
              label="Commodity code"
              value={wizard.values.commodityCode}
              onChangeText={(text) => wizard.updateField('commodityCode', text)}
            />
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
            <AppText variant="bodySmall" color="textSecondary">
              Save the base product first, then configure variations on the next screen. Approval and
              storefront visibility are managed separately.
            </AppText>
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
            <AppButton
              label={wizard.isSaving ? 'Saving...' : 'Save and continue to variations'}
              onPress={() => void handleSaveAndContinue()}
              loading={wizard.isSaving}
              fullWidth
            />
            {wizard.savedProductId ? (
              <AppButton
                label="Open variations"
                variant="outline"
                onPress={handleOpenVariations}
                fullWidth
              />
            ) : null}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {CUSTOMIZABLE_WIZARD_STEPS.map((step, index) => (
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
            Step {wizard.stepIndex + 1} of {CUSTOMIZABLE_WIZARD_STEPS.length}
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
    gap: spacing.sm,
  },
  progressRow: { flexDirection: 'row', gap: spacing.xs },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong },
  progressDotActive: { backgroundColor: colors.primary },
  stepTitle: { fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  stepMeta: { marginBottom: spacing.lg },
  stepContent: { gap: spacing.md },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerActions: { flexDirection: 'row', gap: spacing.md },
  footerButton: { flex: 1 },
});
