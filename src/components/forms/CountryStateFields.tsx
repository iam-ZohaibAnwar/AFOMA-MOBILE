import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '../../design-system';
import {
  createCountryStateSelection,
  getCountrySelectOptions,
  getStateSelectOptions,
  resolveCountryStateSelection,
  type CountryStateSelection,
  type SelectOption,
} from '../../utils/regionOptions';
import { SelectField } from './SelectField';

export interface CountryStateFieldsProps {
  value: CountryStateSelection;
  onChange: (next: CountryStateSelection) => void;
  countryLabel?: string;
  stateLabel?: string;
  countryPlaceholder?: string;
  statePlaceholder?: string;
  countryError?: string;
  stateError?: string;
  disabled?: boolean;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
  countryOptions?: SelectOption[];
}

export function CountryStateFields({
  value,
  onChange,
  countryLabel = 'Country',
  stateLabel = 'State/Province',
  countryPlaceholder = 'Select country',
  statePlaceholder = 'Select state or province',
  countryError,
  stateError,
  disabled = false,
  required = false,
  style,
  countryOptions,
}: CountryStateFieldsProps) {
  const normalizedValue = useMemo(
    () => resolveCountryStateSelection(value),
    [value.country, value.state, value.countryCode, value.stateCode],
  );

  const resolvedCountryOptions = useMemo(
    () => countryOptions ?? getCountrySelectOptions(),
    [countryOptions],
  );
  const stateOptions = useMemo(
    () => getStateSelectOptions(normalizedValue.countryCode),
    [normalizedValue.countryCode],
  );

  const countryFieldLabel = required ? `${countryLabel} *` : countryLabel;
  const stateFieldLabel = required ? `${stateLabel} *` : stateLabel;

  const handleCountryChange = (countryName: string) => {
    onChange(createCountryStateSelection(countryName));
  };

  const handleStateChange = (stateName: string) => {
    onChange(
      createCountryStateSelection(normalizedValue.country, stateName, {
        countryCode: normalizedValue.countryCode,
      }),
    );
  };

  return (
    <View style={[styles.container, style]}>
      <SelectField
        label={countryFieldLabel}
        value={normalizedValue.country}
        options={resolvedCountryOptions}
        onChange={handleCountryChange}
        placeholder={countryPlaceholder}
        error={countryError}
        disabled={disabled}
        modalTitle={countryLabel}
      />
      <SelectField
        label={stateFieldLabel}
        value={normalizedValue.state}
        options={stateOptions}
        onChange={handleStateChange}
        placeholder={statePlaceholder}
        error={stateError}
        disabled={disabled || !normalizedValue.countryCode}
        modalTitle={stateLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
