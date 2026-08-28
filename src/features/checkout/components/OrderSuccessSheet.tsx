import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { OrderSuccessHeroArt } from './OrderSuccessHeroArt';

export interface OrderSuccessSheetProps {
  visible: boolean;
  onTrackOrder: () => void;
  onContinueShopping?: () => void;
}

export function OrderSuccessSheet({
  visible,
  onTrackOrder,
  onContinueShopping,
}: OrderSuccessSheetProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onContinueShopping ?? onTrackOrder}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} accessibilityRole="none" />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          <OrderSuccessHeroArt />

          <AppText variant="h2" style={styles.title}>
            Order Successfully
          </AppText>

          <AppText variant="body" color="textSecondary" style={styles.message}>
            Your order will be packed by the seller and should arrive within 3 to 4 business days.
          </AppText>

          <AppButton
            label="Order Tracking"
            fullWidth
            size="lg"
            shape="pill"
            onPress={onTrackOrder}
            style={styles.primaryAction}
          />

          {onContinueShopping ? (
            <AppButton
              label="Continue shopping"
              variant="ghost"
              fullWidth
              onPress={onContinueShopping}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.floating,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  primaryAction: {
    marginTop: spacing.sm,
  },
});
