import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { useAdminProductVariationsWizard } from '../hooks/useAdminProductVariationsWizard';
import { VARIATION_INVENTORY_OPTIONS } from '../../../seller/products/utils/productTypeConstants';
import { formatRemovedAttributesMessage } from '../../../seller/products/utils/variationAttributes';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductVariations'>;

const RETURN_TO = authReturnTo.adminProductManagement();

export function AdminProductVariationsScreen({ navigation, route }: Props) {
  const {
    productId,
    sellerId: routeSellerId,
    initialProductName,
    initialImages,
  } = route.params;
  const hasInitialContext = Boolean(initialProductName?.trim() || initialImages?.length);
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const wizard = useAdminProductVariationsWizard(routeSellerId, productId, {
    productName: initialProductName,
    images: initialImages,
  });
  const { planToggleAttribute, applyAttributeSelection, refreshAttributes } = wizard;

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refreshAttributes();
      }
    }, [isAuthorized, refreshAttributes]),
  );

  const handleSave = useCallback(async () => {
    await wizard.saveVariations();
  }, [wizard]);

  const handleDone = useCallback(async () => {
    const saved = await wizard.saveVariations();
    if (saved) {
      navigation.goBack();
    }
  }, [navigation, wizard]);

  const handleToggleAttribute = useCallback(
    (attribute: string) => {
      const plan = planToggleAttribute(attribute);

      if (plan.isDeselecting && plan.removedAttributesWithData.length > 0) {
        Alert.alert(
          'Remove attribute?',
          formatRemovedAttributesMessage(plan.removedAttributesWithData),
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              style: 'destructive',
              onPress: () => applyAttributeSelection(plan.nextSelectedAttributes),
            },
          ],
        );
        return;
      }

      applyAttributeSelection(plan.nextSelectedAttributes);
    },
    [applyAttributeSelection, planToggleAttribute],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (wizard.isLoading && !hasInitialContext) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading variations...
        </AppText>
      </View>
    );
  }

  if (wizard.loadError && !hasInitialContext) {
    return (
      <View style={styles.centeredState}>
        <ErrorState
          message={wizard.loadError}
          onAction={() => void wizard.reloadVariations()}
        />
      </View>
    );
  }

  const hasAvailableAttributes = wizard.availableAttributes.length > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="bodyMedium" style={styles.title}>
        {wizard.productName || 'Product variations'}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary">
        Select attributes, then add variation rows. Saving variations does not change approval or
        storefront visibility.
      </AppText>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Attributes
        </AppText>

        {hasAvailableAttributes ? (
          <View style={styles.chipRow}>
            {wizard.availableAttributes.map((attribute) => {
              const selected = wizard.selectedAttributes.includes(attribute);
              return (
                <Pressable
                  key={attribute}
                  accessibilityRole="button"
                  onPress={() => handleToggleAttribute(attribute)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <AppText variant="caption" color={selected ? 'primary' : 'textSecondary'}>
                    {attribute}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No seller attributes yet"
            message="This seller has no global attributes. Attributes must be configured from the seller account before variations can be built."
            style={styles.attributesEmptyState}
          />
        )}
      </AppCard>

      {hasAvailableAttributes ? (
        <>
          <AppButton label="Add variation row" variant="outline" onPress={wizard.addRow} />

          {wizard.rows.map((row, index) => (
            <AppCard key={row.id} variant="flat" style={styles.rowCard}>
              <AppText variant="bodyMedium" style={styles.rowTitle}>
                Variation {index + 1}
              </AppText>

              {wizard.selectedAttributes.map((attribute) => (
                <AppInput
                  key={`${row.id}-${attribute}`}
                  label={`${attribute} *`}
                  value={row[attribute] ?? ''}
                  onChangeText={(text) => wizard.updateRowField(row.id, attribute, text)}
                  error={wizard.rowErrors[index]?.[attribute]}
                />
              ))}

              <SelectField
                label="Inventory *"
                value={row.inventory}
                options={VARIATION_INVENTORY_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                onChange={(value) => wizard.updateRowField(row.id, 'inventory', value)}
                error={wizard.rowErrors[index]?.inventory}
                modalTitle="Inventory"
              />

              <AppInput
                label="Quantity"
                value={row.quantity}
                onChangeText={(text) => wizard.updateRowField(row.id, 'quantity', text)}
                keyboardType="number-pad"
                editable={row.inventory === 'In Stock'}
                error={wizard.rowErrors[index]?.quantity}
              />

              <AppInput
                label="Price (CAD) *"
                value={row.price}
                onChangeText={(text) => wizard.updateRowField(row.id, 'price', text)}
                keyboardType="decimal-pad"
                error={wizard.rowErrors[index]?.price}
              />

              {wizard.hasCurrency ? (
                <AppInput
                  label="Price in selected currency *"
                  value={row.currencyPrice}
                  onChangeText={(text) => wizard.updateRowField(row.id, 'currencyPrice', text)}
                  keyboardType="decimal-pad"
                  error={wizard.rowErrors[index]?.currencyPrice}
                />
              ) : null}

              {wizard.imageOptions.length > 0 ? (
                <SelectField
                  label="Image *"
                  value={row.image}
                  options={wizard.imageOptions}
                  onChange={(value) => wizard.updateRowField(row.id, 'image', value)}
                  error={wizard.rowErrors[index]?.image}
                  modalTitle="Variation image"
                />
              ) : null}

              <AppButton label="Remove row" variant="outline" onPress={() => wizard.removeRow(row.id)} />
            </AppCard>
          ))}

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
            label={wizard.isSaving ? 'Saving...' : 'Save variations'}
            onPress={() => void handleSave()}
            loading={wizard.isSaving}
            fullWidth
          />

          <AppButton
            label="Done"
            variant="outline"
            onPress={() => void handleDone()}
            loading={wizard.isSaving}
            fullWidth
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  title: { fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  attributesEmptyState: {
    marginTop: spacing.sm,
  },
  rowCard: { gap: spacing.sm },
  rowTitle: { fontWeight: '700' },
});
