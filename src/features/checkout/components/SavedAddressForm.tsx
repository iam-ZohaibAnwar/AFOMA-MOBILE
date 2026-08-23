import { StyleSheet, View } from 'react-native';

import { CountryStateFields } from '../../../components/forms';
import { AppInput } from '../../../components/ui/AppInput';
import { colors, spacing } from '../../../design-system';
import type {
  SavedAddressFormField,
  SavedAddressFormValues,
} from '../types/deliveryAddress';

interface SavedAddressFormProps {
  value: SavedAddressFormValues;
  errors?: Partial<Record<SavedAddressFormField, string>>;
  onChange: (field: SavedAddressFormField, nextValue: string) => void;
  disabled?: boolean;
}

export function SavedAddressForm({
  value,
  errors = {},
  onChange,
  disabled = false,
}: SavedAddressFormProps) {
  return (
    <View style={styles.container}>
      <AppInput
        label="First name *"
        value={value.firstName}
        onChangeText={(text) => onChange('firstName', text)}
        error={errors.firstName}
        autoCapitalize="words"
        editable={!disabled}
      />
      <AppInput
        label="Last name *"
        value={value.lastName}
        onChangeText={(text) => onChange('lastName', text)}
        error={errors.lastName}
        autoCapitalize="words"
        editable={!disabled}
      />
      <AppInput
        label="Street address *"
        value={value.streetAddress}
        onChangeText={(text) => onChange('streetAddress', text)}
        error={errors.streetAddress}
        editable={!disabled}
      />
      <AppInput
        label="City *"
        value={value.city}
        onChangeText={(text) => onChange('city', text)}
        error={errors.city}
        autoCapitalize="words"
        editable={!disabled}
      />
      <CountryStateFields
        value={{
          country: value.country,
          state: value.state,
          countryCode: value.countryCode ?? '',
          stateCode: value.stateCode ?? '',
        }}
        onChange={(selection) => {
          onChange('country', selection.country);
          onChange('state', selection.state);
          onChange('countryCode', selection.countryCode);
          onChange('stateCode', selection.stateCode);
        }}
        countryError={errors.country}
        stateError={errors.state}
        disabled={disabled}
        required
      />
      <AppInput
        label="ZIP / Postal code *"
        value={value.zip}
        onChangeText={(text) => onChange('zip', text)}
        error={errors.zip}
        autoCapitalize="characters"
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
