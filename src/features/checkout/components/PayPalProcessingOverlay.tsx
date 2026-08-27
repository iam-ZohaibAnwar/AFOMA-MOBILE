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
  message = 'Processing...',
}: PayPalProcessingOverlayProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.textInverse} />
        <AppText variant="bodyMedium" style={styles.message}>
          {message}
        </AppText>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  message: {
    color: colors.textInverse,
    fontWeight: '600',
    textAlign: 'center',
  },
});
