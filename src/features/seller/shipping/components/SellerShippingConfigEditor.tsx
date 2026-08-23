import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { SellerProfile } from '../../types/sellerProfile';
import { ShippingRegionSection } from './ShippingRegionSection';
import type { SellerShippingFormState } from '../types/sellerShipping';
import { SHIPPING_CURRENCY_OPTIONS } from '../utils/sellerShippingMappers';

export interface SellerShippingConfigEditorProps {
  title?: string;
  profile: SellerProfile | null;
  form: SellerShippingFormState;
  isSaving: boolean;
  saveError: string | null;
  saveSuccessMessage: string | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onUpdateForm: (updater: (current: SellerShippingFormState) => SellerShippingFormState) => void;
  onChangeCurrency: (currency: string) => Promise<void>;
  onSave: () => Promise<boolean>;
  onClearSaveError: () => void;
}

export function SellerShippingConfigEditor({
  title = 'Shipping',
  profile,
  form,
  isSaving,
  saveError,
  saveSuccessMessage,
  contentContainerStyle,
  onUpdateForm,
  onChangeCurrency,
  onSave,
  onClearSaveError,
}: SellerShippingConfigEditorProps) {
  const insets = useSafeAreaInsets();
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

  const selectedCurrencyLabel =
    SHIPPING_CURRENCY_OPTIONS.find((option) => option.value === form.currency)?.label ??
    form.currency.toUpperCase();

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard variant="flat">
          <AppText variant="bodyMedium" style={styles.pageTitle}>
            {title}
          </AppText>

          <View style={styles.block}>
            <AppText variant="bodyMedium" style={styles.blockTitle}>
              Currency
            </AppText>
            <View style={styles.blockDivider} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setCurrencyPickerVisible(true)}
              style={({ pressed }) => [styles.currencyRow, pressed && styles.pressed]}
            >
              <AppText variant="bodyMedium">{selectedCurrencyLabel}</AppText>
              <AppText variant="bodyMedium" color="textSecondary">
                ›
              </AppText>
            </Pressable>
          </View>

          <View style={styles.block}>
            <ShippingRegionSection
              title="Domestic"
              scope="domestic"
              currency={form.currency}
              countryCode={profile?.countryCode}
              region={form.domestic}
              onChange={(domestic) => onUpdateForm((current) => ({ ...current, domestic }))}
            />
          </View>

          <View style={styles.block}>
            <ShippingRegionSection
              title="International"
              scope="international"
              currency={form.currency}
              countryCode={profile?.countryCode}
              region={form.international}
              onChange={(international) => onUpdateForm((current) => ({ ...current, international }))}
            />
          </View>

          <AppText variant="caption" color="textSecondary" style={styles.requirementCopy}>
            At least one shipping method is required for both domestic and international orders.
          </AppText>
        </AppCard>

        {saveError ? (
          <ErrorState message={saveError} style={styles.banner} onAction={onClearSaveError} />
        ) : null}
        {saveSuccessMessage ? (
          <AppCard variant="flat" style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {saveSuccessMessage}
            </AppText>
          </AppCard>
        ) : null}

        <AppButton label={isSaving ? 'Saving...' : 'Save'} loading={isSaving} onPress={() => void onSave()} />
      </ScrollView>

      <Modal
        visible={currencyPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCurrencyPickerVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCurrencyPickerVisible(false)} />
        <View style={[styles.currencySheet, shadows.modal, { paddingBottom: insets.bottom + spacing.lg }]}>
          <AppText variant="bodyMedium" style={styles.currencySheetTitle}>
            Store currency
          </AppText>
          {SHIPPING_CURRENCY_OPTIONS.map((option, index) => {
            const selected = option.value === form.currency;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => {
                  void onChangeCurrency(option.value);
                  setCurrencyPickerVisible(false);
                }}
                style={({ pressed }) => [
                  styles.currencyOption,
                  selected && styles.currencyOptionSelected,
                  pressed && styles.pressed,
                  index === SHIPPING_CURRENCY_OPTIONS.length - 1 && styles.currencyOptionLast,
                ]}
              >
                <AppText variant="bodyMedium">{option.label}</AppText>
                {selected ? (
                  <AppText variant="bodySmall" color="primary">
                    Selected
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
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
  pageTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.xl,
  },
  blockTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  blockDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  requirementCopy: {
    lineHeight: 18,
  },
  banner: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  successBanner: {
    borderColor: colors.success,
  },
  pressed: {
    opacity: 0.85,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  currencySheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  currencySheetTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  currencyOptionSelected: {
    backgroundColor: colors.background,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
  },
  currencyOptionLast: {
    borderBottomWidth: 0,
  },
});
