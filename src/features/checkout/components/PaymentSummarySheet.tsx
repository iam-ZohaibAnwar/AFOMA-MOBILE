import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { CartOrderSummary, type CartOrderSummaryProps } from '../../cart/components/CartOrderSummary';

export interface PaymentSummarySheetProps extends CartOrderSummaryProps {
  payLabel: string;
  payDisabled?: boolean;
  payLoading?: boolean;
  onPay: () => void;
  style?: ViewStyle;
}

export function PaymentSummarySheet({
  payLabel,
  payDisabled,
  payLoading,
  onPay,
  style,
  ...summaryProps
}: PaymentSummarySheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }, style]}>
      <View style={styles.handle} />
      <CartOrderSummary {...summaryProps} />
      <AppButton
        label={payLabel}
        fullWidth
        size="lg"
        shape="pill"
        disabled={payDisabled}
        loading={payLoading}
        onPress={onPay}
        style={styles.payButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  payButton: {
    marginTop: spacing.xs,
  },
});
