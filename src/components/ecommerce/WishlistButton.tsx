import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, layout, radius, shadows } from '../../design-system';

type WishlistButtonSize = 'sm' | 'md';

export interface WishlistButtonProps {
  isActive?: boolean;
  onPress: () => void;
  size?: WishlistButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function WishlistButton({
  isActive = false,
  onPress,
  size = 'md',
  disabled = false,
  style,
}: WishlistButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityState={{ selected: isActive, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        isActive && styles.active,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <AppText
        variant="bodyMedium"
        color={isActive ? 'textInverse' : 'primary'}
        style={styles.icon}
      >
        {isActive ? '♥' : '♡'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  size_sm: {
    width: 32,
    height: 32,
  },
  size_md: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.92,
  },
  icon: {
    fontSize: 16,
    lineHeight: 18,
  },
});
