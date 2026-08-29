import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

interface CustomerOrderActionsSectionProps {
  canCancel: boolean;
  cancelDisabledReason?: string;
  isCancelling: boolean;
  onContactSeller: () => void;
  onCancelOrder: () => void;
}

export function CustomerOrderActionsSection({
  canCancel,
  cancelDisabledReason,
  isCancelling,
  onContactSeller,
  onCancelOrder,
}: CustomerOrderActionsSectionProps) {
  return (
    <View style={styles.card}>
      <AppText variant="bodyMedium" style={styles.title}>
        Actions
      </AppText>

      <AppButton label="Contact Seller" variant="outline" onPress={onContactSeller} fullWidth />

      <AppButton
        label="Cancel Order"
        variant="outline"
        disabled={!canCancel || isCancelling}
        loading={isCancelling}
        onPress={onCancelOrder}
        fullWidth
        style={styles.cancelButton}
        labelStyle={styles.cancelButtonLabel}
      />

      {!canCancel && cancelDisabledReason ? (
        <AppText variant="caption" color="textMuted" style={styles.cancelHint}>
          {cancelDisabledReason}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  cancelButtonLabel: {
    color: colors.error,
  },
  cancelHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
