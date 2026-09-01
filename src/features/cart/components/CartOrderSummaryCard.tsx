import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { CheckoutSurfaceCard } from '../../checkout/components/CheckoutSurfaceCard';
import { formatProductPrice } from '../../products/utils/productDisplay';
import { CartOrderSummary, type CartOrderSummaryProps } from './CartOrderSummary';
import { CartPromoCodeSection } from './CartPromoCodeSection';

export interface CartOrderSummaryCardProps extends CartOrderSummaryProps {
  onApplyPromo: (code: string) => Promise<void>;
  onRemovePromo?: () => void | Promise<void>;
  isApplyingCoupon?: boolean;
  appliedCode?: string;
  couponError?: string | null;
  couponMessage?: string | null;
}

export function CartOrderSummaryCard({
  onApplyPromo,
  onRemovePromo,
  isApplyingCoupon,
  appliedCode,
  couponError,
  couponMessage,
  currency = 'CAD',
  total = null,
  shippingPending = false,
  ...summaryProps
}: CartOrderSummaryCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <CheckoutSurfaceCard style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressed]}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <AppText variant="bodyMedium" style={styles.title}>
            Order summary
          </AppText>
        </View>

        <View style={styles.headerRight}>
          {!expanded ? (
            shippingPending || total == null ? (
              <AppText variant="bodyMedium" color="textMuted" style={styles.collapsedTotal}>
                —
              </AppText>
            ) : (
              <AppText variant="bodyMedium" style={styles.collapsedTotal}>
                {formatProductPrice(total, currency)}
              </AppText>
            )
          ) : null}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <CartPromoCodeSection
            onApply={onApplyPromo}
            onRemove={onRemovePromo}
            isApplying={isApplyingCoupon}
            appliedCode={appliedCode}
            error={couponError}
            message={couponMessage}
          />

          <CartOrderSummary
            currency={currency}
            total={total}
            shippingPending={shippingPending}
            {...summaryProps}
          />

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">
              Secure checkout
            </AppText>
          </View>
        </View>
      ) : null}
    </CheckoutSurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  title: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  collapsedTotal: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    gap: spacing.md,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
});
