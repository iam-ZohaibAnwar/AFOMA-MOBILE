import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { layout, radius, spacing, withSafeAreaBottom } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

/** Reserve scroll space so content clears the overlay Add to Cart button. */
export function getProductDetailStickyBarInset(bottomInset = 0): number {
  return spacing.sm + layout.minTouchTarget + 6 + spacing.sm + bottomInset;
}

export interface ProductDetailStickyBarProps {
  theme: PdpTheme;
  buttonLabel: string;
  disabled: boolean;
  isLoading: boolean;
  onAddToCart: () => void;
}

export function ProductDetailStickyBar({
  theme,
  buttonLabel,
  disabled,
  isLoading,
  onAddToCart,
}: ProductDetailStickyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: withSafeAreaBottom(spacing.sm, insets.bottom),
        },
      ]}
    >
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
    backgroundColor: 'transparent',
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
