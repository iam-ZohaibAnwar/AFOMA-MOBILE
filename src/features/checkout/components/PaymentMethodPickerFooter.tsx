import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { useMarketplaceChromeOptional } from '../../../app/navigation/marketplaceChrome';
import { getMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';
import { formatProductPrice } from '../../products/utils/productDisplay';

interface PaymentMethodPickerFooterProps {
  currency: string;
  total?: number | null;
  shippingPending?: boolean;
  payLabel?: string;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueLoadingLabel?: string;
  hasFooterTabs?: boolean;
}

export function PaymentMethodPickerFooter({
  currency,
  total = null,
  shippingPending = false,
  payLabel,
  onContinue,
  continueDisabled,
  continueLoading,
  continueLoadingLabel,
  hasFooterTabs = false,
}: PaymentMethodPickerFooterProps) {
  const insets = useSafeAreaInsets();
  const chrome = useMarketplaceChromeOptional();
  const footerInset =
    chrome?.footerContentInset ?? getMarketplaceFooterContentInset(insets.bottom);
  const bottomPadding = hasFooterTabs ? footerInset + spacing.md : insets.bottom + spacing.md;

  const totalLabel =
    shippingPending || total == null ? '—' : formatProductPrice(total, currency);
  const buttonLabel =
    payLabel ??
    (continueLoading
      ? continueLoadingLabel ?? 'One moment…'
      : total != null && !shippingPending
        ? `Pay ${formatProductPrice(total, currency)} now`
        : 'Pay now');

  return (
    <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
      <View style={styles.totalBar}>
        <AppText variant="body" color="textSecondary">
          Total to pay
        </AppText>
        <AppText
          variant="h2"
          style={[styles.totalValue, shippingPending && styles.totalPending]}
        >
          {totalLabel}
        </AppText>
      </View>

      <AppButton
        label={buttonLabel}
        onPress={onContinue}
        disabled={continueDisabled}
        loading={continueLoading}
        fullWidth
        size="lg"
        shape="pill"
        variant="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.floating,
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
});
