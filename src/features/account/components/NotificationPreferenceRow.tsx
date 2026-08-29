import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface NotificationPreferenceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  mode: 'toggle' | 'navigate';
  value?: boolean;
  valueLabel?: string;
  disabled?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  showDivider?: boolean;
}

export function NotificationPreferenceRow({
  icon,
  title,
  description,
  mode,
  value = false,
  valueLabel,
  disabled = false,
  onToggle,
  onPress,
  showDivider = true,
}: NotificationPreferenceRowProps) {
  const content = (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.title}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>

      {mode === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
          style={styles.trailingControl}
        />
      ) : (
        <View style={styles.navigateTrailing}>
          {valueLabel ? (
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {valueLabel}
            </AppText>
          ) : null}
          <ChevronForwardIcon color={colors.textMuted} size={18} />
        </View>
      )}
    </View>
  );

  return (
    <View>
      {mode === 'navigate' ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [pressed && !disabled && styles.pressed]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDisabled: {
    opacity: 0.55,
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
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  trailingControl: {
    alignSelf: 'center',
  },
  navigateTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '42%',
    alignSelf: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginLeft: 40 + spacing.md,
  },
});
