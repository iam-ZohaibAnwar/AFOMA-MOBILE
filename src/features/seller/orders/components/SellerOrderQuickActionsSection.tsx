import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

interface SellerOrderQuickActionsSectionProps {
  shippingDisabled?: boolean;
  canDownloadLabel: boolean;
  canPrintPackingSlip: boolean;
  canSchedulePickup: boolean;
  isOpeningLabel: boolean;
  isOpeningInvoice: boolean;
  isGeneratingLabel: boolean;
  onDownloadLabel: () => void;
  onPrintPackingSlip: () => void;
  onSchedulePickup: () => void;
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
        style={[
          styles.buttonLabel,
          embedded && styles.buttonLabelEmbedded,
          disabled && styles.buttonLabelDisabled,
        ]}
        numberOfLines={2}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function SellerOrderQuickActionsSection({
  shippingDisabled = false,
  canDownloadLabel,
  canPrintPackingSlip,
  canSchedulePickup,
  isOpeningLabel,
  isOpeningInvoice,
  isGeneratingLabel,
  onDownloadLabel,
  onPrintPackingSlip,
  onSchedulePickup,
  embedded = false,
}: SellerOrderQuickActionsSectionProps) {
  const hasActions = canDownloadLabel || canPrintPackingSlip || canSchedulePickup;

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

      {canSchedulePickup ? (
        <QuickActionButton
          label="Schedule Pickup"
          icon="calendar-outline"
          onPress={onSchedulePickup}
          disabled={shippingDisabled}
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
