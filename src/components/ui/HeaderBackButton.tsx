import { Pressable, StyleSheet, View } from 'react-native';

import { colors, layout, spacing } from '../../design-system';
import { stackHeaderTitleStyle } from '../../app/navigation/stackHeaderStyles';
import { BackChevronIcon } from './BackChevronIcon';
import { AppText } from './AppText';

export interface HeaderBackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  title?: string;
}

export function HeaderBackButton({
  onPress,
  color = colors.textPrimary,
  size = 13,
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
      <View style={styles.iconWrap}>
        <BackChevronIcon color={color} size={size} strokeWidth={2} />
      </View>
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
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  buttonWithTitle: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
    paddingRight: spacing.sm,
    maxWidth: 220,
  },
  iconWrap: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...stackHeaderTitleStyle,
    marginLeft: -2,
  },
  pressed: {
    opacity: 0.85,
  },
});
