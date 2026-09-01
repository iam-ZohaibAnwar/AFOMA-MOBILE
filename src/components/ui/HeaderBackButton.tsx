import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '../../design-system';
import { stackHeaderTitleStyle } from '../../app/navigation/stackHeaderStyles';
import { AppText } from './AppText';

const MIN_TOUCH_TARGET = 44;

export interface HeaderBackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  title?: string;
}

const DEFAULT_CHEVRON_SIZE = Platform.OS === 'ios' ? 24 : 22;

export function HeaderBackButton({
  onPress,
  color = colors.textPrimary,
  size = DEFAULT_CHEVRON_SIZE,
  accessibilityLabel = 'Go back',
  title,
}: HeaderBackButtonProps) {
  const label = title?.trim();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ? `Back to ${label}` : accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        label ? styles.buttonWithTitle : styles.button,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="chevron-back"
        size={size}
        color={color}
        style={label ? styles.chevronWithTitle : styles.chevron}
      />
      {label ? (
        <AppText style={[styles.title, { color }]} numberOfLines={1}>
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWithTitle: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    maxWidth: 220,
  },
  chevron: {
    textAlign: 'center',
  },
  chevronWithTitle: {
    marginRight: Platform.OS === 'ios' ? -2 : 0,
  },
  title: {
    ...stackHeaderTitleStyle,
  },
  pressed: {
    opacity: 0.85,
  },
});
