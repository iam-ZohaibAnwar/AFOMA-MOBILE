import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShippingAddress } from '../types/shippingAddress';

export interface PaymentAddressSectionProps {
  address: ShippingAddress;
  onEdit?: () => void;
}

function formatPaymentAddress(address: ShippingAddress): string {
  return [
    address.streetAddress,
    address.city,
    address.state,
    address.zip,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function PaymentAddressSection({ address, onEdit }: PaymentAddressSectionProps) {
  const formattedAddress = formatPaymentAddress(address);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <AppText variant="h3" style={styles.title}>
          Address
        </AppText>
        {onEdit ? (
          <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={8}>
            <AppText variant="bodyMedium" color="textLink">
              Edit
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <AppText variant="body" color="textSecondary" style={styles.addressText}>
          {formattedAddress || 'Delivery address not set'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  addressText: {
    lineHeight: 22,
  },
});
