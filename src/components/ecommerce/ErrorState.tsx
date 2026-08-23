import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { colors, radius, screenPaddingHorizontal, spacing } from '../../design-system';

export interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  message,
  actionLabel = 'Try again',
  onAction,
  loading = false,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      <AppText variant="body" color="error" style={styles.message}>
        {message}
      </AppText>
      {onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          loading={loading}
          variant="primary"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: screenPaddingHorizontal,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.large,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
