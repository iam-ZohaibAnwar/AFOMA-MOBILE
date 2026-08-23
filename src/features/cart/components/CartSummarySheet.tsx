import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { formatProductPrice } from '../../products/utils/productDisplay';
import { CartOrderSummary, type CartOrderSummaryProps } from './CartOrderSummary';
import { CartPromoCodeSection } from './CartPromoCodeSection';

export interface CartSummarySheetProps extends CartOrderSummaryProps {
  onApplyPromo: (code: string) => Promise<void>;
  onRemovePromo?: () => void | Promise<void>;
  isApplyingCoupon?: boolean;
  appliedCode?: string;
  couponError?: string | null;
  couponMessage?: string | null;
  checkoutDisabled?: boolean;
  onCheckout: () => void;
  style?: ViewStyle;
}

export function CartSummarySheet({
  onApplyPromo,
  onRemovePromo,
  isApplyingCoupon,
  appliedCode,
  couponError,
  couponMessage,
  checkoutDisabled,
  onCheckout,
  style,
  currency = 'CAD',
  total = null,
  ...summaryProps
}: CartSummarySheetProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(true);

  const totalLabel =
    total == null ? '—' : formatProductPrice(total, currency);

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse order summary' : 'Expand order summary'}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.handleWrap, pressed && styles.pressed]}
      >
        <View style={styles.handle} />
        <View style={styles.handleRow}>
          <AppText variant="bodyMedium" style={styles.handleTitle}>
            Order summary
          </AppText>
          <AppText variant="bodyMedium" color="textLink">
            {expanded ? 'Hide' : 'Show'}
          </AppText>
        </View>
        {!expanded ? (
          <View style={styles.collapsedTotalRow}>
            <AppText variant="body" color="textSecondary">
              Total amount
            </AppText>
            <AppText variant="bodyMedium" style={styles.collapsedTotalValue}>
              {totalLabel}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={styles.expandedContent}>
          <CartPromoCodeSection
            onApply={onApplyPromo}
            onRemove={onRemovePromo}
            isApplying={isApplyingCoupon}
            appliedCode={appliedCode}
            error={couponError}
            message={couponMessage}
          />

          <CartOrderSummary currency={currency} total={total} {...summaryProps} />
        </View>
      ) : null}

      <AppButton
        label="Checkout"
        fullWidth
        size="lg"
        shape="pill"
        disabled={checkoutDisabled}
        onPress={onCheckout}
        style={styles.checkoutButton}
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
    gap: spacing.sm,
    ...shadows.floating,
  },
  handleWrap: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  handleTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  collapsedTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedTotalValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  expandedContent: {
    gap: spacing.sm,
  },
  checkoutButton: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
