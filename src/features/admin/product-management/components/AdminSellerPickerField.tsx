import { ActivityIndicator, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';

export interface AdminSellerPickerFieldProps {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (sellerId: string) => void;
  error?: string;
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  disabled?: boolean;
}

export function AdminSellerPickerField({
  value,
  options,
  onChange,
  error,
  isLoading = false,
  loadError,
  onRetry,
  disabled = false,
}: AdminSellerPickerFieldProps) {
  if (isLoading && options.length === 0) {
    return (
      <View style={{ paddingVertical: spacing.sm }}>
        <ActivityIndicator size="small" />
        <AppText variant="caption" color="textSecondary">
          Loading sellers...
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <SelectField
        tone="surface"
        label="Seller *"
        value={value}
        options={options}
        onChange={onChange}
        placeholder="Select seller"
        error={error}
        disabled={disabled || options.length === 0}
        modalTitle="Select seller"
      />
      {loadError ? (
        <ErrorState message={loadError} onAction={onRetry} style={{ marginHorizontal: 0 }} />
      ) : null}
    </View>
  );
}
