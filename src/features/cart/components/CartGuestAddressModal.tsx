import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectOptionsSheet } from '../../../components/forms/SelectOptionsSheet';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, spacing } from '../../../design-system';
import {
  createCountryStateSelection,
  getCountrySelectOptions,
  getStateSelectOptions,
  resolveCountryStateSelection,
} from '../../../utils/regionOptions';
import { ShippingAddressForm } from '../../checkout/components/ShippingAddressForm';
import type { ShippingAddress, ShippingAddressField } from '../../checkout/types/shippingAddress';

export interface CartGuestAddressModalProps {
  visible: boolean;
  value: ShippingAddress;
  errors?: Partial<Record<ShippingAddressField, string>>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onChange: (field: ShippingAddressField, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const FOOTER_BUTTON_HEIGHT = 56;
const KEYBOARD_SCROLL_BOTTOM_OFFSET = FOOTER_BUTTON_HEIGHT + spacing.xl;

type RegionPicker = 'country' | 'state';

export function CartGuestAddressModal({
  visible,
  value,
  errors,
  isSubmitting = false,
  errorMessage,
  onChange,
  onSubmit,
  onClose,
}: CartGuestAddressModalProps) {
  const insets = useSafeAreaInsets();
  const [activeRegionPicker, setActiveRegionPicker] = useState<RegionPicker | null>(null);

  const countryStateValue = useMemo(
    () =>
      resolveCountryStateSelection({
        country: value.country,
        state: value.state,
        countryCode: value.countryCode,
        stateCode: value.stateCode,
      }),
    [value.country, value.countryCode, value.state, value.stateCode],
  );

  const countryOptions = useMemo(() => getCountrySelectOptions(), []);
  const stateOptions = useMemo(
    () => getStateSelectOptions(countryStateValue.countryCode),
    [countryStateValue.countryCode],
  );

  useEffect(() => {
    if (!visible) {
      setActiveRegionPicker(null);
    }
  }, [visible]);

  const applyCountryStateSelection = (selection: ReturnType<typeof createCountryStateSelection>) => {
    onChange('country', selection.country);
    onChange('state', selection.state);
    onChange('countryCode', selection.countryCode);
    onChange('stateCode', selection.stateCode);
  };

  const handleCountrySelect = (countryName: string) => {
    applyCountryStateSelection(createCountryStateSelection(countryName));
  };

  const handleStateSelect = (stateName: string) => {
    applyCountryStateSelection(
      createCountryStateSelection(countryStateValue.country, stateName, {
        countryCode: countryStateValue.countryCode,
      }),
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <View style={[styles.screen, { paddingTop: insets.top }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeading}>
              <HeaderBackButton onPress={onClose} title="Cart" />
            </View>
            <AppText variant="h3" style={styles.title} pointerEvents="none">
              Continue as guest
            </AppText>
          </View>

          <KeyboardAwareScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.content}
            bottomOffset={KEYBOARD_SCROLL_BOTTOM_OFFSET}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <AppText variant="body" color="textSecondary">
              Enter your delivery details to continue checkout.
            </AppText>

            <ShippingAddressForm
              value={value}
              errors={errors ?? {}}
              onChange={onChange}
              hostedCountryStatePickers
              onOpenCountryPicker={() => setActiveRegionPicker('country')}
              onOpenStatePicker={() => setActiveRegionPicker('state')}
            />

            {errorMessage ? (
              <AppText variant="bodySmall" color="error">
                {errorMessage}
              </AppText>
            ) : null}
          </KeyboardAwareScrollView>

          <KeyboardStickyView offset={{ closed: 0, opened: spacing.sm }}>
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
              <AppButton
                label={isSubmitting ? 'Submitting...' : 'Continue'}
                onPress={onSubmit}
                disabled={isSubmitting}
                fullWidth
                size="lg"
                shape="pill"
              />
            </View>
          </KeyboardStickyView>
        </View>
      </Modal>

      <SelectOptionsSheet
        visible={activeRegionPicker === 'country'}
        title="Country"
        options={countryOptions}
        value={countryStateValue.country}
        onSelect={handleCountrySelect}
        onClose={() => setActiveRegionPicker(null)}
      />

      <SelectOptionsSheet
        visible={activeRegionPicker === 'state'}
        title="State/Province"
        options={stateOptions}
        value={countryStateValue.state}
        onSelect={handleStateSelect}
        onClose={() => setActiveRegionPicker(null)}
        emptyLabel={
          countryStateValue.countryCode
            ? 'No states available for this country'
            : 'Select a country first'
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 44,
  },
  headerLeading: {
    position: 'absolute',
    left: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: spacing.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
});
