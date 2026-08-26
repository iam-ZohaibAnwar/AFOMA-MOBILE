import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { CheckoutShippingOption } from '../../checkout/hooks/useCheckoutShippingRates';
import { formatConsolidatedShippingSummary } from '../utils/shippingSummary';

export interface CartShippingSectionProps {
  isAuthenticated: boolean;
  isLoadingAuthAddress?: boolean;
  needsDeliveryDetails: boolean;
  canFetchRates: boolean;
  isLoading: boolean;
  error: string | null;
  selectedOptions: CheckoutShippingOption[];
  selectedShippingCost: number;
  hasMultipleSellers: boolean;
  onOpenDeliveryDetails: () => void;
  onOpenShippingOptions: () => void;
  onSignIn: () => void;
  onRetry: () => void;
}

export function CartShippingSection({
  isAuthenticated,
  isLoadingAuthAddress = false,
  needsDeliveryDetails,
  canFetchRates,
  isLoading,
  error,
  selectedOptions,
  selectedShippingCost,
  hasMultipleSellers,
  onOpenDeliveryDetails,
  onOpenShippingOptions,
  onSignIn,
  onRetry,
}: CartShippingSectionProps) {
  if (isLoadingAuthAddress) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="body" color="textSecondary">
          Loading your saved delivery address...
        </AppText>
      </View>
    );
  }

  if (needsDeliveryDetails) {
    return (
      <View style={styles.gateBox}>
        <AppText variant="label">Shipping</AppText>
        <AppText variant="body" color="textSecondary">
          {isAuthenticated
            ? 'Your account does not have a complete delivery address yet. Add one to calculate shipping.'
            : 'Sign in or continue as a guest with your delivery address to calculate shipping.'}
        </AppText>
        <View style={styles.actions}>
          {!isAuthenticated ? <AppButton label="Sign in" variant="outline" onPress={onSignIn} /> : null}
          <AppButton
            label={isAuthenticated ? 'Add delivery address' : 'Continue as guest'}
            onPress={onOpenDeliveryDetails}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <AppText variant="label">Shipping</AppText>

      {!canFetchRates ? (
        <AppText variant="body" color="textSecondary">
          Complete delivery details to calculate shipping.
        </AppText>
      ) : isLoading ? (
        <View style={styles.inlineState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="body" color="textSecondary">
            Calculating shipping rates...
          </AppText>
        </View>
      ) : error ? (
        <View style={styles.inlineState}>
          <AppText variant="bodySmall" color="error">
            {error}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onRetry}>
            <AppText variant="bodyMedium" color="textLink">
              Try again
            </AppText>
          </Pressable>
        </View>
      ) : selectedOptions.length > 0 ? (
        <View style={styles.summaryBox}>
          <AppText variant="bodyMedium" style={styles.summaryText}>
            {formatConsolidatedShippingSummary(selectedOptions, selectedShippingCost)}
          </AppText>
          {hasMultipleSellers ? (
            <AppText variant="caption" color="textMuted">
              All items ship to your delivery address. Shipping is combined at checkout.
            </AppText>
          ) : null}
        </View>
      ) : (
        <AppText variant="body" color="textSecondary">
          No shipping options available.
        </AppText>
      )}

      {!isLoading && !error && selectedOptions.length > 0 ? (
        <Pressable accessibilityRole="button" onPress={onOpenShippingOptions}>
          <AppText variant="bodyMedium" color="textLink">
            Change shipping
          </AppText>
        </Pressable>
      ) : null}

      {isAuthenticated ? (
        <Pressable accessibilityRole="button" onPress={onOpenDeliveryDetails}>
          <AppText variant="bodyMedium" color="textLink">
            Change delivery address
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
  },
  gateBox: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
  loadingBox: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  inlineState: {
    gap: spacing.sm,
  },
  summaryBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryText: {
    color: colors.textPrimary,
  },
});
