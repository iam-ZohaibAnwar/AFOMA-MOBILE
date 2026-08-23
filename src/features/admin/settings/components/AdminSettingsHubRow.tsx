import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface AdminSettingsHubRowProps {
  title: string;
  description?: string;
  onPress: () => void;
  showDivider?: boolean;
}

export function AdminSettingsHubRow({
  title,
  description,
  onPress,
  showDivider = true,
}: AdminSettingsHubRowProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.textWrap}>
          <AppText variant="bodyMedium" style={styles.title}>
            {title}
          </AppText>
          {description ? (
            <AppText variant="caption" color="textSecondary">
              {description}
            </AppText>
          ) : null}
        </View>
        <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
          ›
        </AppText>
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
});
