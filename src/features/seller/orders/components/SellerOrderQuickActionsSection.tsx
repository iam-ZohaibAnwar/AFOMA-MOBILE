import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { OrderDetailSection } from '../../../orders/components/OrderDetailSection';

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
}

function QuickActionTile({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        disabled && styles.tileDisabled,
        pressed && !disabled && styles.tilePressed,
      ]}
    >
      <View style={[styles.iconWrap, disabled ? styles.iconWrapDisabled : null]}>
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? colors.textMuted : colors.textInverse}
        />
      </View>
      <AppText
        variant="bodySmall"
        style={[styles.tileLabel, disabled && styles.tileLabelDisabled]}
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
}: SellerOrderQuickActionsSectionProps) {
  const hasActions = canDownloadLabel || canPrintPackingSlip || canSchedulePickup;

  if (!hasActions) {
    return null;
  }

  return (
    <OrderDetailSection title="Quick Actions" icon="flash-outline">
      <View style={styles.grid}>
        {canDownloadLabel ? (
          <QuickActionTile
            label={isOpeningLabel || isGeneratingLabel ? 'Opening label...' : 'Download Shipping Label'}
            icon="car-outline"
            onPress={onDownloadLabel}
            disabled={shippingDisabled || isOpeningLabel || isGeneratingLabel || isOpeningInvoice}
          />
        ) : null}

        {canPrintPackingSlip ? (
          <QuickActionTile
            label={isOpeningInvoice ? 'Opening slip...' : 'Print Packing Slip'}
            icon="print-outline"
            onPress={onPrintPackingSlip}
            disabled={shippingDisabled || isOpeningInvoice || isOpeningLabel || isGeneratingLabel}
          />
        ) : null}

        {canSchedulePickup ? (
          <QuickActionTile
            label="Schedule Pickup"
            icon="calendar-outline"
            onPress={onSchedulePickup}
            disabled={shippingDisabled}
          />
        ) : null}
      </View>
    </OrderDetailSection>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  tilePressed: {
    opacity: 0.9,
  },
  tileDisabled: {
    opacity: 0.55,
  },
  tileLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tileLabelDisabled: {
    color: colors.textMuted,
  },
});
