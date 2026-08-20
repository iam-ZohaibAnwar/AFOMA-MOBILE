import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { homeColors, homeRadii, homeShadows, homeSpacing } from '../theme/homeTheme';

type HomeStatePanelProps = {
  message: string;
  tone?: 'neutral' | 'error' | 'empty';
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function HomeStatePanel({
  message,
  tone = 'neutral',
  loading = false,
  actionLabel,
  onAction,
}: HomeStatePanelProps) {
  return (
    <View
      style={[
        styles.panel,
        tone === 'error' && styles.panelError,
        tone === 'empty' && styles.panelEmpty,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={homeColors.primary} /> : null}
      <Text style={[styles.message, tone === 'error' && styles.messageError]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.actionButton} onPress={() => void onAction()}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: homeSpacing.screen,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: homeRadii.md,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    alignItems: 'center',
    gap: 12,
    ...homeShadows.soft,
  },
  panelError: {
    backgroundColor: homeColors.errorBg,
    borderColor: homeColors.errorBorder,
  },
  panelEmpty: {
    backgroundColor: homeColors.surfaceMuted,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: homeColors.textMuted,
    textAlign: 'center',
  },
  messageError: {
    color: homeColors.error,
  },
  actionButton: {
    backgroundColor: homeColors.primary,
    borderRadius: homeRadii.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  actionText: {
    color: homeColors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
