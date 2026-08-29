import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronForwardIcon } from '../../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface AdminSettingsHubRowProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showDivider?: boolean;
}

export function AdminSettingsHubRow({
  title,
  description,
  icon,
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
        {icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={20} color={colors.textInverse} />
          </View>
        ) : null}

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

        <ChevronForwardIcon color={colors.textMuted} size={18} />
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
});
