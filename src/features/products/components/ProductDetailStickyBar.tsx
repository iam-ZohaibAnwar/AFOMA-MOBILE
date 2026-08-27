import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, radius, shadows, spacing, withSafeAreaBottom } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

/** Reserve scroll space so content clears the overlay Add to Cart button. */
export function getProductDetailStickyBarInset(
  bottomInset = 0,
  hasFeedback = false,
): number {
  const feedbackHeight = hasFeedback ? 56 : 0;
  return feedbackHeight + spacing.sm + layout.minTouchTarget + 6 + spacing.sm + bottomInset;
}

export interface ProductDetailStickyFeedback {
  type: 'success' | 'error';
  message: string;
  onViewCart?: () => void;
}

export interface ProductDetailStickyBarProps {
  theme: PdpTheme;
  buttonLabel: string;
  disabled: boolean;
  isLoading: boolean;
  onAddToCart: () => void;
  feedback?: ProductDetailStickyFeedback | null;
}

export function ProductDetailStickyBar({
  theme,
  buttonLabel,
  disabled,
  isLoading,
  onAddToCart,
  feedback,
}: ProductDetailStickyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: withSafeAreaBottom(spacing.sm, insets.bottom),
        },
        shadows.card,
      ]}
    >
      {feedback ? (
        <View
          style={[
            styles.feedback,
            {
              backgroundColor:
                feedback.type === 'success' ? theme.deliveryBannerBg : colors.surfaceMuted,
              borderColor: theme.border,
            },
          ]}
        >
          <AppText
            variant="bodySmall"
            style={{
              flex: 1,
              color: feedback.type === 'success' ? theme.deliveryBannerText : theme.textPrimary,
            }}
          >
            {feedback.message}
          </AppText>
          {feedback.type === 'success' && feedback.onViewCart ? (
            <Pressable accessibilityRole="button" onPress={feedback.onViewCart}>
              <AppText variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '600' }}>
                View cart
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled || isLoading}
        onPress={onAddToCart}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: theme.pillSelectedBg,
          },
          (disabled || isLoading) && styles.ctaDisabled,
          pressed && !disabled && !isLoading && styles.pressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.pillSelectedText} />
        ) : (
          <AppText variant="button" style={{ color: theme.pillSelectedText }}>
            {buttonLabel}
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.large,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cta: {
    width: '100%',
    minHeight: layout.minTouchTarget + 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
});
