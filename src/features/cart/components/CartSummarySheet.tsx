import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import {
  useMarketplaceChromeOptional,
} from '../../../app/navigation/marketplaceChrome';
import { getMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';
import { formatProductPrice } from '../../products/utils/productDisplay';
import { CartOrderSummary, type CartOrderSummaryProps } from './CartOrderSummary';
import { CartPromoCodeSection } from './CartPromoCodeSection';
import { SummaryValuePending } from './SummaryValuePending';

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
  /** When true, marketplace tab bar sits below this sheet (safe area handled by footer). */
  hasFooterTabs?: boolean;
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
  hasFooterTabs = false,
  currency = 'CAD',
  total = null,
  shippingPending = false,
  ...summaryProps
}: CartSummarySheetProps) {
  const insets = useSafeAreaInsets();
  const chrome = useMarketplaceChromeOptional();
  const footerInset =
    chrome?.footerContentInset ?? getMarketplaceFooterContentInset(insets.bottom);
  const [expanded, setExpanded] = useState(true);

  const totalLabel =
    shippingPending || total == null ? '—' : formatProductPrice(total, currency);
  const bottomPadding = hasFooterTabs ? footerInset + spacing.md : insets.bottom + spacing.md;

  return (
    <View style={[styles.sheet, { paddingBottom: bottomPadding }, style]}>
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
            {shippingPending ? (
              <SummaryValuePending emphasized delayMs={0} />
            ) : (
              <AppText variant="bodyMedium" style={styles.collapsedTotalValue}>
                {totalLabel}
              </AppText>
            )}
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

          <CartOrderSummary currency={currency} total={total} shippingPending={shippingPending} {...summaryProps} />
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
