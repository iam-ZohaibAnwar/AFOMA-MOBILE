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
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { SelectField } from '../../../components/forms';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { StandardProductImageList } from '../products/components/StandardProductImageList';
import { ProductShippingEstimateTrigger } from '../products/components/ProductShippingEstimateTrigger';
import { useSellerProductCategories } from '../products/hooks/useSellerProductCategories';
import { useStandardProductWizard } from '../products/hooks/useStandardProductWizard';
import { navigateToIncompleteSellerSetup } from '../products/utils/sellerProductCreationNavigation';
import {
  SELLER_INVENTORY_OPTIONS,
  STANDARD_WIZARD_STEPS,
} from '../products/utils/standardProductConstants';
import { canSellerCreateProducts } from '../utils/sellerProductGate';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerStandardProduct'>;

const STANDARD_RETURN_TO = authReturnTo.sellerProductType();

export function SellerStandardProductScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const isEditMode = Boolean(productId);
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(STANDARD_RETURN_TO);
  const { profile, isLoading: isProfileLoading } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const canCreate = canSellerCreateProducts(profile?.profileSetup);

  const wizard = useStandardProductWizard(sellerId, productId);
  const categories = useSellerProductCategories();
  const [isAddingImage, setIsAddingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isEditMode) {
        return;
      }

      if (!isAuthorized || isProfileLoading || !profile) {
        return;
      }

      if (!canCreate) {
        navigateToIncompleteSellerSetup(navigation, profile);
      }
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

  const handleAddImage = async () => {
    setIsAddingImage(true);
    try {
      await wizard.addImageFromPicker();
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleSave = async () => {
    const productId = await wizard.saveProduct();
    if (productId) {
      wizard.goToStep('review');
    }
  };

  const handleSubmitForReview = async () => {
    const success = await wizard.submitForReview();
    if (success) {
      navigation.navigate('SellerProducts');
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isProfileLoading && !profile) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!canCreate && !isEditMode) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (wizard.isLoadingProduct) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading product...
        </AppText>
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

  const renderStep = () => {
    switch (wizard.currentStep.id) {
      case 'basic':
        return (
          <View style={styles.stepContent}>
            <AppInput
              label="Product name *"
              value={wizard.values.productName}
              onChangeText={(text) => wizard.updateField('productName', text)}
              placeholder="Enter product name"
              maxLength={120}
              error={wizard.fieldErrors.productName}
            />
            <AppInput
              label="Description *"
              value={wizard.values.description}
              onChangeText={(text) => wizard.updateField('description', text)}
              placeholder="Describe your product"
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
            {categories.isLoadingParents ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <SelectField
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
                <SelectField
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

            {wizard.values.subCategoryId ? (
              categories.isLoadingChildCategories ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : categories.childCategoryOptions.length > 0 ? (
                <SelectField
                  label="Child category"
                  value={wizard.values.childCategoryId}
                  options={categories.childCategoryOptions}
                  onChange={(value) => wizard.updateField('childCategoryId', value)}
                  placeholder="Select child category (optional)"
                  modalTitle="Child category"
                />
              ) : (
                <AppText variant="bodySmall" color="textSecondary">
                  No child categories for this subcategory.
                </AppText>
              )
            ) : null}

            {categories.error ? (
              <ErrorState message={categories.error} style={styles.inlineError} />
            ) : null}
          </View>
        );

      case 'images':
        return (
          <StandardProductImageList
            images={wizard.images}
            error={wizard.fieldErrors.images}
            onAdd={() => void handleAddImage()}
            onRemove={wizard.removeImage}
            onMove={wizard.moveImage}
            onAltTextChange={wizard.updateImageAltText}
            isAdding={isAddingImage}
          />
        );

      case 'pricing':
        return (
          <View style={styles.stepContent}>
            <SelectField
              label="Inventory *"
              value={wizard.values.inventory}
              options={SELLER_INVENTORY_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onChange={(value) =>
                wizard.updateField('inventory', value as typeof wizard.values.inventory)
              }
              placeholder="Select inventory status"
              error={wizard.fieldErrors.inventory}
              modalTitle="Inventory"
            />

            <AppInput
              label="Quantity *"
              value={wizard.values.quantity}
              onChangeText={(text) => wizard.updateField('quantity', text)}
              placeholder="Enter quantity"
              keyboardType="number-pad"
              error={wizard.fieldErrors.quantity}
            />

            <SelectField
              label="Currency"
              value={wizard.values.currency}
              options={wizard.currencyOptions}
              onChange={(value) => wizard.updateField('currency', value)}
              placeholder="Select currency"
              disabled={wizard.isLoadingCurrencies}
              modalTitle="Currency"
            />

            {wizard.values.currency !== 'cad' ? (
              <AppInput
                label={`Price in ${wizard.values.currency.toUpperCase()}`}
                value={wizard.values.currencyPrice}
                onChangeText={(text) => wizard.updateField('currencyPrice', text)}
                placeholder="Enter price in selected currency"
                keyboardType="decimal-pad"
                error={wizard.fieldErrors.currencyPrice}
              />
            ) : null}

            <AppInput
              label="Price (CAD) *"
              value={wizard.values.price}
              onChangeText={(text) => wizard.updateField('price', text)}
              placeholder="Enter product price in CAD"
              keyboardType="decimal-pad"
              editable={wizard.values.currency === 'cad'}
              error={wizard.fieldErrors.price}
            />
          </View>
        );

      case 'shipping':
        return (
          <View style={styles.stepContent}>
            {(['weight', 'length', 'width', 'height', 'dispatchDays'] as const).map((field) => (
              <AppInput
                key={field}
                label={`${field === 'dispatchDays' ? 'Dispatch days' : field.charAt(0).toUpperCase() + field.slice(1)} *`}
                value={wizard.values[field]}
                onChangeText={(text) => wizard.updateField(field, text)}
                placeholder={`Enter ${field}`}
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
                quantity: wizard.values.quantity,
              }}
              price={wizard.values.price}
            />

            <View style={styles.switchRow}>
              <AppText variant="bodyMedium">Custom shipping options</AppText>
              <Switch
                value={wizard.values.isCustomShipping}
                onValueChange={(value) => wizard.updateField('isCustomShipping', value)}
                trackColor={{ false: colors.borderStrong, true: colors.primary }}
              />
            </View>

            {wizard.values.isCustomShipping ? (
              <>
                <View style={styles.switchRow}>
                  <AppText variant="bodyMedium">Free delivery</AppText>
                  <Switch
                    value={wizard.values.freeDelivery}
                    onValueChange={(value) => wizard.updateField('freeDelivery', value)}
                    trackColor={{ false: colors.borderStrong, true: colors.primary }}
                  />
                </View>
                <AppInput
                  label="Handling fee *"
                  value={wizard.values.handlingFee}
                  onChangeText={(text) => wizard.updateField('handlingFee', text)}
                  placeholder="Enter handling fee"
                  keyboardType="decimal-pad"
                  error={wizard.fieldErrors.handlingFee}
                />
                <AppInput
                  label="Additional cost"
                  value={wizard.values.additionalCost}
                  onChangeText={(text) => wizard.updateField('additionalCost', text)}
                  placeholder="Required when free delivery is enabled"
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
            <AppInput
              label="Commodity code"
              value={wizard.values.commodityCode}
              onChangeText={(text) => wizard.updateField('commodityCode', text)}
              placeholder="Optional HS code"
            />
            <AppInput
              label="Meta title"
              value={wizard.values.metaTitle}
              onChangeText={(text) => wizard.updateField('metaTitle', text)}
              placeholder="Optional SEO title"
            />
            <AppInput
              label="Meta keywords"
              value={wizard.values.metaKeywords}
              onChangeText={(text) => wizard.updateField('metaKeywords', text)}
              placeholder="Optional keywords"
            />
            <AppInput
              label="Meta description"
              value={wizard.values.metaDesc}
              onChangeText={(text) => wizard.updateField('metaDesc', text)}
              placeholder="Optional SEO description"
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
            <AppInput
              label="Discount (%)"
              value={wizard.values.discountCode}
              onChangeText={(text) => wizard.updateField('discountCode', text)}
              placeholder="Optional discount percentage"
              keyboardType="number-pad"
            />
          </View>
        );

      case 'review':
        return (
          <View style={styles.stepContent}>
            <AppText variant="bodyMedium" style={styles.reviewTitle}>
              Review your product
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Name: {wizard.values.productName || '—'}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Category: {wizard.values.categoryId ? 'Selected' : '—'}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Images: {wizard.uploadedImageCount}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Price (CAD): {wizard.values.price || '—'}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Inventory: {wizard.values.inventory || '—'} / Qty {wizard.values.quantity || '—'}
            </AppText>

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

            {wizard.submitError ? (
              <ErrorState
                message={wizard.submitError}
                onAction={() => wizard.setSubmitError(null)}
              />
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {STANDARD_WIZARD_STEPS.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressDot,
                index <= wizard.stepIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <AppCard variant="flat">
          <AppText variant="bodyMedium" style={styles.stepTitle}>
            {wizard.currentStep.title}
          </AppText>
          <AppText variant="caption" color="textMuted" style={styles.stepMeta}>
            Step {wizard.stepIndex + 1} of {STANDARD_WIZARD_STEPS.length}
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
    backgroundColor: colors.background,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepMeta: {
    marginBottom: spacing.lg,
  },
  stepContent: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  inlineError: {
    marginHorizontal: 0,
  },
  reviewTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
