import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.header}>
          <AppText variant="h3">Delivery details</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <AppText variant="bodyMedium" color="textLink">
              Close
            </AppText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="body" color="textSecondary">
            Enter your delivery address so we can calculate shipping before checkout.
          </AppText>

          <ShippingAddressForm value={value} errors={errors ?? {}} onChange={onChange} />

          {errorMessage ? (
            <AppText variant="bodySmall" color="error">
              {errorMessage}
            </AppText>
          ) : null}

          <AppButton
            label={isSubmitting ? 'Saving...' : 'Calculate shipping'}
            onPress={onSubmit}
            disabled={isSubmitting}
            fullWidth
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
