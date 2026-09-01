import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

interface AdminOrderQuickActionsSectionProps {
  shippingDisabled?: boolean;
  canDownloadLabel: boolean;
  canPrintPackingSlip: boolean;
  canPayShipment: boolean;
  isOpeningLabel: boolean;
  isOpeningInvoice: boolean;
  isGeneratingLabel: boolean;
  isPayingShipment: boolean;
  onDownloadLabel: () => void;
  onPrintPackingSlip: () => void;
  onPayShipment: () => void;
  embedded?: boolean;
}

function QuickActionButton({
  label,
  icon,
  onPress,
  disabled,
  embedded = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  embedded?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        embedded && styles.buttonEmbedded,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={embedded ? colors.textInverse : disabled ? colors.textMuted : colors.textInverse}
      />
      <AppText
        variant="bodySmall"
        style={[styles.buttonLabel, embedded && styles.buttonLabelEmbedded, disabled && styles.buttonLabelDisabled]}
        numberOfLines={2}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function AdminOrderQuickActionsSection({
  shippingDisabled = false,
  canDownloadLabel,
  canPrintPackingSlip,
  canPayShipment,
  isOpeningLabel,
  isOpeningInvoice,
  isGeneratingLabel,
  isPayingShipment,
  onDownloadLabel,
  onPrintPackingSlip,
  onPayShipment,
  embedded = false,
}: AdminOrderQuickActionsSectionProps) {
  const hasActions = canDownloadLabel || canPrintPackingSlip || canPayShipment;

  if (!hasActions) {
    return null;
  }

  return (
    <View style={styles.list}>
      {canDownloadLabel ? (
        <QuickActionButton
          label={isOpeningLabel || isGeneratingLabel ? 'Downloading label...' : 'Download Label'}
          icon="car-outline"
          onPress={onDownloadLabel}
          disabled={shippingDisabled || isOpeningLabel || isGeneratingLabel || isOpeningInvoice}
          embedded={embedded}
        />
      ) : null}

      {canPrintPackingSlip ? (
        <QuickActionButton
          label={isOpeningInvoice ? 'Opening slip...' : 'Print Slip'}
          icon="print-outline"
          onPress={onPrintPackingSlip}
          disabled={shippingDisabled || isOpeningInvoice || isOpeningLabel || isGeneratingLabel}
          embedded={embedded}
        />
      ) : null}

      {canPayShipment ? (
        <QuickActionButton
          label={isPayingShipment ? 'Paying shipment...' : 'Pay Shipment'}
          icon="card-outline"
          onPress={onPayShipment}
          disabled={shippingDisabled || isPayingShipment}
          embedded={embedded}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonEmbedded: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  buttonLabelEmbedded: {
    color: colors.textInverse,
  },
  buttonLabelDisabled: {
    color: colors.textMuted,
  },
});
