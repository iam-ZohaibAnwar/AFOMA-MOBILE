import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectOptionsSheet } from '../../../components/forms/SelectOptionsSheet';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { colors, spacing } from '../../../design-system';
import {
  createCountryStateSelection,
  getCountrySelectOptions,
  getStateSelectOptions,
  resolveCountryStateSelection,
} from '../../../utils/regionOptions';
import type { SavedAddressFormField, SavedAddressFormValues } from '../types/deliveryAddress';
import { SavedAddressForm } from './SavedAddressForm';

export interface SavedAddressFormSheetProps {
  visible: boolean;
  title: string;
  value: SavedAddressFormValues;
  errors?: Partial<Record<SavedAddressFormField, string>>;
  isSaving?: boolean;
  errorMessage?: string | null;
  onChange: (field: SavedAddressFormField, nextValue: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const FOOTER_BUTTON_HEIGHT = 56;
const KEYBOARD_SCROLL_BOTTOM_OFFSET = FOOTER_BUTTON_HEIGHT + spacing.xl;
const SHEET_CHROME_HEIGHT = 108;

type RegionPicker = 'country' | 'state';

export function SavedAddressFormSheet({
  visible,
  title,
  value,
  errors,
  isSaving = false,
  errorMessage,
  onChange,
  onSave,
  onClose,
}: SavedAddressFormSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [activeRegionPicker, setActiveRegionPicker] = useState<RegionPicker | null>(null);
  const sheetMaxHeight = Math.round(windowHeight * 0.88);
  const scrollMaxHeight = Math.max(
    160,
    sheetMaxHeight - SHEET_CHROME_HEIGHT - insets.bottom - spacing.md - FOOTER_BUTTON_HEIGHT,
  );

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

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        scrollable={false}
        maxHeightRatio={0.88}
        chromeHeight={SHEET_CHROME_HEIGHT}
        header={
          <View style={styles.headerRow}>
            <View style={styles.headerSide} />
            <AppText variant="h3" style={styles.title} numberOfLines={1}>
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={8}
              style={styles.headerSide}
            >
              <AppText variant="bodyMedium" color="textLink">
                Close
              </AppText>
            </Pressable>
          </View>
        }
        footer={
          <KeyboardStickyView offset={{ closed: 0, opened: spacing.sm }}>
            <View style={{ paddingBottom: Math.max(insets.bottom, spacing.sm) }}>
              <AppButton
                label={isSaving ? 'Saving...' : 'Save address'}
                onPress={onSave}
                disabled={isSaving}
                fullWidth
                size="lg"
                shape="pill"
              />
            </View>
          </KeyboardStickyView>
        }
      >
        <KeyboardAwareScrollView
          style={{ maxHeight: scrollMaxHeight }}
          bottomOffset={KEYBOARD_SCROLL_BOTTOM_OFFSET}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.formContent}
        >
          <SavedAddressForm
            tone="surface"
            value={value}
            errors={errors ?? {}}
            onChange={onChange}
            disabled={isSaving}
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
      </BottomSheet>

      <SelectOptionsSheet
        visible={activeRegionPicker === 'country'}
        title="Country"
        options={countryOptions}
        value={countryStateValue.country}
        onSelect={(countryName) => applyCountryStateSelection(createCountryStateSelection(countryName))}
        onClose={() => setActiveRegionPicker(null)}
      />

      <SelectOptionsSheet
        visible={activeRegionPicker === 'state'}
        title="State/Province"
        options={stateOptions}
        value={countryStateValue.state}
        onSelect={(stateName) =>
          applyCountryStateSelection(
            createCountryStateSelection(countryStateValue.country, stateName, {
              countryCode: countryStateValue.countryCode,
            }),
          )
        }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSide: {
    width: 56,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
});
