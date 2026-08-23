import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../design-system';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  inset = true,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, inset && styles.inset, style]}>
      <View style={styles.textBlock}>
        <AppText variant="h2" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          hitSlop={8}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <AppText variant="label" color="primary" style={styles.actionLabel}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  inset: {
    paddingHorizontal: screenPaddingHorizontal,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  actionButton: {
    paddingTop: spacing.xs,
  },
  actionLabel: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
