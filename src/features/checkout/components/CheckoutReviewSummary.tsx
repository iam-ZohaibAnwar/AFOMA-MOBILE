import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { CheckoutShippingOption } from '../hooks/useCheckoutShippingRates';
import type { ShippingAddress } from '../types/shippingAddress';
import { formatProductPrice } from '../../products/utils/productDisplay';
import { CheckoutSurfaceCard } from './CheckoutSurfaceCard';

interface CheckoutReviewSummaryProps {
  email?: string;
  phone?: string;
  address: ShippingAddress;
  shippingOptions: CheckoutShippingOption[];
  currency: string;
  onEditShipping?: () => void;
}

function formatAddressLine(address: ShippingAddress): string {
  const parts = [
    address.name.trim(),
    address.streetAddress.trim(),
    [address.city.trim(), address.state.trim(), address.zip.trim()].filter(Boolean).join(', '),
    address.country.trim(),
  ].filter(Boolean);

  return parts.join('\n');
}

function ReviewBlock({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <AppText variant="caption" style={styles.blockLabel}>
          {label}
        </AppText>
        {onEdit ? (
          <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={8}>
            <AppText variant="caption" color="textLink" style={styles.editLink}>
              Edit
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <AppText variant="bodySmall" style={styles.blockValue}>
        {value}
      </AppText>
    </View>
  );
}

export function CheckoutReviewSummary({
  email,
  phone,
  address,
  shippingOptions,
  currency,
  onEditShipping,
}: CheckoutReviewSummaryProps) {
  const contactLines = [email?.trim(), phone?.trim()].filter(Boolean).join('\n');
  const primaryShipping = shippingOptions[0];
  const shippingLabel = shippingOptions.length
    ? shippingOptions.map((option) => option.label).join('\n')
    : 'Standard shipping';
  const shippingPrice =
    shippingOptions.length > 0
      ? formatProductPrice(
          shippingOptions.reduce((sum, option) => sum + option.rate, 0),
          currency,
        )
      : null;

  return (
    <CheckoutSurfaceCard style={styles.card}>
      {contactLines ? (
        <>
          <ReviewBlock label="CONTACT INFORMATION" value={contactLines} />
          <View style={styles.divider} />
        </>
      ) : null}

      <ReviewBlock
        label="SHIPPING ADDRESS"
        value={formatAddressLine(address)}
        onEdit={onEditShipping}
      />

      <View style={styles.divider} />

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <AppText variant="caption" style={styles.blockLabel}>
            DELIVERY METHOD
          </AppText>
          {shippingPrice ? (
            <AppText variant="bodyMedium" style={styles.shippingPrice}>
              {shippingPrice}
            </AppText>
          ) : null}
        </View>
        <AppText variant="bodySmall" style={styles.blockValue}>
          {shippingLabel}
        </AppText>
      </View>

      <View style={styles.secureRow}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted">
          Secure checkout
        </AppText>
      </View>
    </CheckoutSurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  block: {
    gap: spacing.xs,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  blockLabel: {
    letterSpacing: 0.6,
    fontWeight: '700',
    color: colors.textMuted,
  },
  blockValue: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  editLink: {
    fontWeight: '700',
  },
  shippingPrice: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
