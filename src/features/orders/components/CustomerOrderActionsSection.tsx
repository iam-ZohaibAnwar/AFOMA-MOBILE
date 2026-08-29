import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

interface CustomerOrderActionsSectionProps {
  canCancel: boolean;
  cancelDisabledReason?: string;
  isCancelling: boolean;
  onContactSeller: () => void;
  onCancelOrder: () => void;
  embedded?: boolean;
}

function EmbeddedActionButton({
  label,
  icon,
  onPress,
  disabled,
  destructive = false,
  loading = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.embeddedButton,
        disabled && styles.embeddedButtonDisabled,
        pressed && !disabled && !loading && styles.embeddedButtonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textInverse} />
      ) : (
        <Ionicons
          name={icon}
          size={18}
          color={
            disabled
              ? 'rgba(255,255,255,0.45)'
              : destructive
                ? '#ffb4b4'
                : colors.textInverse
          }
        />
      )}
      <AppText
        variant="bodySmall"
        style={[
          styles.embeddedButtonLabel,
          disabled && styles.embeddedButtonLabelDisabled,
          destructive && !disabled && styles.embeddedButtonLabelDestructive,
        ]}
        numberOfLines={2}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function CustomerOrderActionsSection({
  canCancel,
  cancelDisabledReason,
  isCancelling,
  onContactSeller,
  onCancelOrder,
  embedded = false,
}: CustomerOrderActionsSectionProps) {
  if (embedded) {
    return (
      <View style={styles.embeddedActions}>
        <EmbeddedActionButton
          label="Contact Seller"
          icon="chatbubble-outline"
          onPress={onContactSeller}
        />
        <EmbeddedActionButton
          label={isCancelling ? 'Cancelling…' : 'Cancel Order'}
          icon="close-circle-outline"
          onPress={onCancelOrder}
          disabled={!canCancel}
          destructive={canCancel}
          loading={isCancelling}
        />
        {!canCancel && cancelDisabledReason ? (
          <AppText variant="caption" style={styles.embeddedHint}>
            {cancelDisabledReason}
          </AppText>
        ) : null}
      </View>
    );
  }

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
  embeddedActions: {
    gap: spacing.sm,
  },
  embeddedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  embeddedButtonPressed: {
    opacity: 0.92,
  },
  embeddedButtonDisabled: {
    opacity: 0.55,
  },
  embeddedButtonLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  embeddedButtonLabelDisabled: {
    color: 'rgba(255,255,255,0.55)',
  },
  embeddedButtonLabelDestructive: {
    color: '#ffb4b4',
  },
  embeddedHint: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 18,
  },
  cancelLabel: {
    color: colors.error,
  },
  cancelHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
