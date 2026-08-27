import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { useMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome';
import {
  getMarketplaceFooterSafeInset,
  MARKETPLACE_FOOTER_BOTTOM_GAP,
} from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';
import { layout, radius, shadows, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

/** Gap between the sticky CTA pill and the floating tab footer. */
export const PRODUCT_DETAIL_STICKY_FOOTER_GAP = spacing.sm;

/** Reserve scroll space so content clears the overlay Add to Cart button and floating footer. */
export function getProductDetailStickyBarInset(
  footerContentInset: number,
  hasFeedback = false,
): number {
  const feedbackHeight = hasFeedback ? 56 : 0;
  return (
    feedbackHeight +
    spacing.sm +
    layout.minTouchTarget +
    6 +
    spacing.sm +
    (footerContentInset > 0 ? PRODUCT_DETAIL_STICKY_FOOTER_GAP + footerContentInset : 0)
  );
}

export type ProductDetailAddToCartCtaMode = 'add' | 'viewCart' | 'loading';

export interface ProductDetailAddToCartCtaProps {
  theme: PdpTheme;
  buttonLabel: string;
  disabled: boolean;
  mode: ProductDetailAddToCartCtaMode;
  onPress: () => void;
  floating?: boolean;
}

export function ProductDetailAddToCartCta({
  theme,
  buttonLabel,
  disabled,
  mode,
  onPress,
  floating = false,
}: ProductDetailAddToCartCtaProps) {
  const isLoading = mode === 'loading';
  const isViewCart = mode === 'viewCart';
  const label = isViewCart ? 'View cart' : buttonLabel;
  const backgroundColor = theme.pillSelectedBg;
  const labelColor = theme.pillSelectedText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cta,
        { backgroundColor },
        floating ? shadows.floating : null,
        (disabled || isLoading) && styles.ctaDisabled,
        pressed && !disabled && !isLoading && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.pillSelectedText} />
      ) : (
        <AppText variant="button" style={{ color: labelColor }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export interface ProductDetailStickyBarProps {
  theme: PdpTheme;
  buttonLabel: string;
  disabled: boolean;
  isLoading: boolean;
  ctaMode: ProductDetailAddToCartCtaMode;
  onPress: () => void;
  footerHidden?: boolean;
}

export function ProductDetailStickyBar({
  theme,
  buttonLabel,
  disabled,
  isLoading,
  ctaMode,
  onPress,
  footerHidden = false,
}: ProductDetailStickyBarProps) {
  const insets = useSafeAreaInsets();
  const footerInset = useMarketplaceFooterContentInset();
  const safeBottom = getMarketplaceFooterSafeInset(insets.bottom);
  const bottomOffset = footerHidden
    ? safeBottom + MARKETPLACE_FOOTER_BOTTOM_GAP
    : footerInset + PRODUCT_DETAIL_STICKY_FOOTER_GAP;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          paddingBottom: spacing.sm,
        },
      ]}
    >
      <ProductDetailAddToCartCta
        theme={theme}
        buttonLabel={buttonLabel}
        disabled={disabled}
        mode={isLoading ? 'loading' : ctaMode}
        onPress={onPress}
        floating
      />
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
    zIndex: 50,
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
