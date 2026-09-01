import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { useMarketplaceChromeOptional } from '../../../app/navigation/marketplaceChrome';
import { getMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';
import { CartOrderSummary, type CartOrderSummaryProps } from '../../cart/components/CartOrderSummary';
import { formatProductPrice } from '../../products/utils/productDisplay';
import type { PaymentMethodId } from './PaymentMethodOption';

export interface PaymentMethodSheetItem {
  id: PaymentMethodId;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

export interface PaymentMethodSheetProps extends CartOrderSummaryProps {
  methods: PaymentMethodSheetItem[];
  selectedMethod: PaymentMethodId;
  onSelectMethod: (id: PaymentMethodId) => void;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  onConfirm: () => void;
  style?: ViewStyle;
  /** When true, marketplace tab bar sits below this sheet (safe area handled by footer). */
  hasFooterTabs?: boolean;
}

function MethodBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption" style={styles.badgeText}>
        {label.slice(0, 1).toUpperCase()}
      </AppText>
    </View>
  );
}

function PaymentMethodRow({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethodSheetItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: method.disabled }}
      disabled={method.disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.methodCard,
        selected && styles.methodCardSelected,
        method.disabled && styles.methodCardDisabled,
        pressed && !method.disabled && styles.pressed,
      ]}
    >
      <MethodBadge label={method.label} />

      <View style={styles.methodContent}>
        <AppText variant="bodyMedium" style={styles.methodLabel}>
          {method.label}
        </AppText>
        {method.subtitle ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {method.subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <AppText style={styles.checkmark}>✓</AppText> : null}
      </View>
    </Pressable>
  );
}

export function PaymentMethodSheet({
  methods,
  selectedMethod,
  onSelectMethod,
  confirmLabel = 'Confirm Payment',
  confirmLoadingLabel = 'One moment…',
  confirmDisabled,
  confirmLoading,
  onConfirm,
  style,
  hasFooterTabs = false,
  currency = 'CAD',
  total = null,
  ...summaryProps
}: PaymentMethodSheetProps) {
  const insets = useSafeAreaInsets();
  const chrome = useMarketplaceChromeOptional();
  const footerInset =
    chrome?.footerContentInset ?? getMarketplaceFooterContentInset(insets.bottom);
  const [expanded, setExpanded] = useState(true);
  const selectedMethodConfig = methods.find((method) => method.id === selectedMethod);
  const isConfirmDisabled =
    confirmDisabled || confirmLoading || !selectedMethodConfig || selectedMethodConfig.disabled;
  const totalLabel = total == null ? '—' : formatProductPrice(total, currency);
  const bottomPadding = hasFooterTabs ? footerInset + spacing.md : insets.bottom + spacing.md;

  return (
    <View style={[styles.sheet, { paddingBottom: bottomPadding }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse payment methods' : 'Expand payment methods'}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.handleWrap, pressed && styles.pressed]}
      >
        <View style={styles.handle} />
        <View style={styles.handleRow}>
          <AppText variant="bodyMedium" style={styles.handleTitle}>
            Payment method
          </AppText>
          <AppText variant="bodyMedium" color="textLink">
            {expanded ? 'Hide' : 'Show'}
          </AppText>
        </View>

        {!expanded ? (
          <View style={styles.collapsedRows}>
            <View style={styles.collapsedRow}>
              <AppText variant="body" color="textSecondary">
                Selected
              </AppText>
              <AppText variant="bodyMedium" style={styles.collapsedValue}>
                {selectedMethodConfig?.label ?? '—'}
              </AppText>
            </View>
            <View style={styles.collapsedRow}>
              <AppText variant="body" color="textSecondary">
                Total amount
              </AppText>
              <AppText variant="bodyMedium" style={styles.collapsedValue}>
                {totalLabel}
              </AppText>
            </View>
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={styles.expandedContent}>
          <View style={styles.methodsList}>
            {methods.map((method) => (
              <PaymentMethodRow
                key={method.id}
                method={method}
                selected={selectedMethod === method.id}
                onSelect={() => onSelectMethod(method.id)}
              />
            ))}
          </View>

          <CartOrderSummary currency={currency} total={total} {...summaryProps} />
        </View>
      ) : null}

      <AppButton
        label={confirmLoading ? confirmLoadingLabel : confirmLabel}
        fullWidth
        size="lg"
        shape="pill"
        disabled={isConfirmDisabled}
        loading={confirmLoading}
        onPress={onConfirm}
        style={styles.confirmButton}
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
  collapsedRows: {
    gap: spacing.xs,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  expandedContent: {
    gap: spacing.sm,
  },
  methodsList: {
    gap: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  methodCardDisabled: {
    opacity: 0.65,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  methodContent: {
    flex: 1,
    gap: 2,
  },
  methodLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  confirmButton: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
