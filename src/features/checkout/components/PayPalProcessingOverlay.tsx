import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

interface PayPalProcessingOverlayProps {
  visible: boolean;
  message?: string;
}

export function PayPalProcessingOverlay({
  visible,
  message = 'Processing your PayPal payment...',
}: PayPalProcessingOverlayProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyMedium" style={styles.message}>
            {message}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.hint}>
            Please wait while we confirm your order.
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
});
