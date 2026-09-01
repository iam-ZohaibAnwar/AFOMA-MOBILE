import { useMemo } from 'react';
import { StyleSheet, View, type NativeSyntheticEvent, type TextInputFocusEventData } from 'react-native';
import { CountryStateFields } from '../../../components/forms';
import { AppInput } from '../../../components/ui/AppInput';
import { spacing } from '../../../design-system';
import type { CountryStateSelection } from '../../../utils/regionOptions';
import type {
  ShippingAddress,
  ShippingAddressErrors,
  ShippingAddressField,
} from '../types/shippingAddress';

interface ShippingAddressFormProps {
  value: ShippingAddress;
  errors: ShippingAddressErrors;
  onChange: (field: ShippingAddressField, nextValue: string) => void;
  tone?: 'default' | 'surface';
  hostedCountryStatePickers?: boolean;
  onOpenCountryPicker?: () => void;
  onOpenStatePicker?: () => void;
  onFieldFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

export function ShippingAddressForm({
  value,
  errors,
  onChange,
  tone = 'surface',
  hostedCountryStatePickers = false,
  onOpenCountryPicker,
  onOpenStatePicker,
  onFieldFocus,
}: ShippingAddressFormProps) {
  const countryStateValue = useMemo(
    () => ({
      country: value.country,
      state: value.state,
      countryCode: value.countryCode ?? '',
      stateCode: value.stateCode ?? '',
    }),
    [value.country, value.countryCode, value.state, value.stateCode],
  );

  const handleCountryStateChange = (selection: CountryStateSelection) => {
    onChange('country', selection.country);
    onChange('state', selection.state);
    onChange('countryCode', selection.countryCode);
    onChange('stateCode', selection.stateCode);
  };

  return (
    <View style={styles.container}>
      <AppInput
        tone={tone}
        label="Full Name *"
        value={value.name}
        onChangeText={(text) => onChange('name', text)}
        placeholder="Full name"
        autoCapitalize="words"
        autoCorrect={false}
        error={errors.name}
        onFocus={onFieldFocus}
      />

      <AppInput
        tone={tone}
        label="Email Address *"
        value={value.email}
        onChangeText={(text) => onChange('email', text)}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        onFocus={onFieldFocus}
      />

      <AppInput
        tone={tone}
        label="Address *"
        value={value.streetAddress}
        onChangeText={(text) => onChange('streetAddress', text)}
        placeholder="Street address"
        autoCorrect={false}
        error={errors.streetAddress}
        onFocus={onFieldFocus}
      />

      <AppInput
        tone={tone}
        label="City *"
        value={value.city}
        onChangeText={(text) => onChange('city', text)}
        placeholder="City"
        autoCapitalize="words"
        autoCorrect={false}
        error={errors.city}
        onFocus={onFieldFocus}
      />

      <CountryStateFields
        tone={tone}
        required
        value={countryStateValue}
        onChange={handleCountryStateChange}
        countryError={errors.country}
        stateError={errors.state}
        hostedPickers={hostedCountryStatePickers}
        onOpenCountryPicker={onOpenCountryPicker}
        onOpenStatePicker={onOpenStatePicker}
      />

      <AppInput
        tone={tone}
        label="Zip/Postal Code *"
        value={value.zip}
        onChangeText={(text) => onChange('zip', text)}
        placeholder="ZIP / Postal code"
        autoCapitalize="characters"
        autoCorrect={false}
        error={errors.zip}
        onFocus={onFieldFocus}
      />

      <AppInput
        tone={tone}
        label="Phone Number *"
        value={value.phone}
        onChangeText={(text) => onChange('phone', text)}
        placeholder="Phone number"
        keyboardType="phone-pad"
        autoCorrect={false}
        error={errors.phone}
        onFocus={onFieldFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
