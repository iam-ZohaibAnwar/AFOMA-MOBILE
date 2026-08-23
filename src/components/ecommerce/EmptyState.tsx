import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { colors, radius, screenPaddingHorizontal, shadows, spacing } from '../../design-system';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="text">
      <View style={styles.iconCircle}>
        <AppText variant="h3" color="textMuted">
          ◌
        </AppText>
      </View>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color="textMuted" style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="outline" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: screenPaddingHorizontal,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
