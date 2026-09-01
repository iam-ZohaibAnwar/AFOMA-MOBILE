import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '../../../components/ui/BottomSheet';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
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
  const handleDismiss = onContinueShopping ?? onTrackOrder;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleDismiss}
      scrollable={false}
      chromeHeight={48}
      sheetStyle={styles.sheet}
      contentContainerStyle={styles.content}
    >
      <View style={styles.body}>
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  body: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
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
