import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { layout, radius, shadows, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

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
          backgroundColor: theme.stickyBarBg,
          borderTopColor: theme.stickyBarBorder,
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
        shadows.card,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        disabled={disabled || isLoading}
        onPress={onAddToCart}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: theme.pillSelectedBg },
          (disabled || isLoading) && styles.ctaDisabled,
          pressed && !disabled && !isLoading && styles.pressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.pillSelectedText} />
        ) : (
          <View style={styles.ctaContent}>
            <AppText variant="bodyMedium" style={{ color: theme.pillSelectedText }}>
              🛍
            </AppText>
            <AppText variant="button" style={{ color: theme.pillSelectedText }}>
              {buttonLabel}
            </AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    width: '100%',
    minHeight: layout.minTouchTarget + 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.92,
  },
});
