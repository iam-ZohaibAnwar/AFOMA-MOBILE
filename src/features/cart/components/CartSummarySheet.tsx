import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import {
  useMarketplaceChromeOptional,
} from '../../../app/navigation/marketplaceChrome';
import { getMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';
import { formatProductPrice } from '../../products/utils/productDisplay';

export interface CartSummarySheetProps {
  currency?: string;
  total?: number | null;
  shippingPending?: boolean;
  checkoutDisabled?: boolean;
  onCheckout: () => void;
  showAuthGate?: boolean;
  onSignIn?: () => void;
  onContinueAsGuest?: () => void;
  style?: ViewStyle;
  hasFooterTabs?: boolean;
}

export function CartSummarySheet({
  currency = 'CAD',
  total = null,
  shippingPending = false,
  checkoutDisabled,
  onCheckout,
  showAuthGate = false,
  onSignIn,
  onContinueAsGuest,
  style,
  hasFooterTabs = false,
}: CartSummarySheetProps) {
  const insets = useSafeAreaInsets();
  const chrome = useMarketplaceChromeOptional();
  const footerInset =
    chrome?.footerContentInset ?? getMarketplaceFooterContentInset(insets.bottom);
  const bottomPadding = hasFooterTabs ? footerInset + spacing.md : insets.bottom + spacing.md;

  const totalLabel =
    shippingPending || total == null ? '—' : formatProductPrice(total, currency);

  if (showAuthGate) {
    return (
      <View style={[styles.sheet, { paddingBottom: bottomPadding }, style]}>
        <AppText variant="bodySmall" color="textSecondary" style={styles.authGateCopy}>
          Sign in or continue as guest to calculate shipping and pay.
        </AppText>

        <View style={styles.authGateActions}>
          <AppButton
            label="Sign in"
            variant="outline"
            fullWidth
            size="lg"
            shape="pill"
            onPress={onSignIn}
          />
          <AppButton
            label="Continue as guest"
            fullWidth
            size="lg"
            shape="pill"
            onPress={onContinueAsGuest}
          />
        </View>

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">
            Secure checkout
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.sheet, { paddingBottom: bottomPadding }, style]}>
      <View style={styles.totalBar}>
        <AppText variant="body" color="textSecondary">
          Total
        </AppText>
        <AppText
          variant="h2"
          style={[styles.totalValue, shippingPending && styles.totalPending]}
        >
          {totalLabel}
        </AppText>
      </View>

      <AppButton
        label="Continue to payment"
        fullWidth
        size="lg"
        shape="pill"
        variant="primary"
        disabled={checkoutDisabled}
        onPress={onCheckout}
      />

      <View style={styles.secureRow}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted">
          Secure checkout
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    ...shadows.floating,
  },
  authGateCopy: {
    textAlign: 'center',
    lineHeight: 20,
  },
  authGateActions: {
    gap: spacing.sm,
  },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  totalPending: {
    color: colors.textMuted,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
