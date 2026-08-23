import { Pressable, StyleSheet } from 'react-native';

import { colors, layout } from '../../design-system';
import { BackChevronIcon } from './BackChevronIcon';

export interface HeaderBackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
}

export function HeaderBackButton({
  onPress,
  color = colors.textPrimary,
  size = 13,
  accessibilityLabel = 'Go back',
}: HeaderBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <BackChevronIcon color={color} size={size} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  pressed: {
    opacity: 0.85,
  },
});
