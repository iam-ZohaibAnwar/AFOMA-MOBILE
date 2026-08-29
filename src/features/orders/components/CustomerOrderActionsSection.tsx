import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

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
    <View style={styles.actions}>
      <AppButton label="Contact seller" variant="primary" onPress={onContactSeller} fullWidth />

      <AppButton
        label={isCancelling ? 'Cancelling…' : 'Cancel order'}
        variant="outline"
        disabled={!canCancel || isCancelling}
        loading={isCancelling}
        onPress={onCancelOrder}
        fullWidth
        labelStyle={styles.cancelLabel}
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
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  cancelLabel: {
    color: colors.error,
  },
  cancelHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
