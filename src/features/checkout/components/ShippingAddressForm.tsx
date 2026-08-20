import { StyleSheet, Text, TextInput, View } from 'react-native';

import type {
  ShippingAddress,
  ShippingAddressErrors,
  ShippingAddressField,
} from '../types/shippingAddress';

interface ShippingAddressFormProps {
  value: ShippingAddress;
  errors: ShippingAddressErrors;
  onChange: (field: ShippingAddressField, nextValue: string) => void;
}

interface AddressFieldConfig {
  field: ShippingAddressField;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
}

const ADDRESS_FIELDS: AddressFieldConfig[] = [
  { field: 'name', label: 'Name', placeholder: 'Full name', autoCapitalize: 'words' },
  {
    field: 'email',
    label: 'Email',
    placeholder: 'Email address',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  { field: 'phone', label: 'Phone', placeholder: 'Phone number', keyboardType: 'phone-pad' },
  { field: 'streetAddress', label: 'Street address', placeholder: 'Street address' },
  { field: 'city', label: 'City', placeholder: 'City', autoCapitalize: 'words' },
  { field: 'state', label: 'State', placeholder: 'State / Province', autoCapitalize: 'words' },
  { field: 'zip', label: 'ZIP', placeholder: 'ZIP / Postal code' },
  { field: 'country', label: 'Country', placeholder: 'Country', autoCapitalize: 'words' },
];

export function ShippingAddressForm({ value, errors, onChange }: ShippingAddressFormProps) {
  return (
    <View style={styles.container}>
      {ADDRESS_FIELDS.map(({ field, label, placeholder, keyboardType, autoCapitalize }) => (
        <View key={field} style={styles.fieldWrap}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value[field]}
            onChangeText={(text) => onChange(field, text)}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            style={[styles.input, errors[field] ? styles.inputError : null]}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={autoCapitalize ?? 'sentences'}
            autoCorrect={false}
          />
          {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172554',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#172554',
  },
  inputError: {
    borderColor: '#F87171',
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 16,
  },
});
