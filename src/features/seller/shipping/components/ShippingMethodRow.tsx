import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface ShippingMethodRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  valueLabel?: string;
  mode: 'toggle' | 'navigate';
  enabled?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showDivider?: boolean;
}

export function ShippingMethodRow({
  icon,
  label,
  subtitle,
  valueLabel,
  mode,
  enabled = false,
  disabled = false,
  onPress,
  onToggle,
  showDivider = true,
}: ShippingMethodRowProps) {
  const content = (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <AppText variant="bodyMedium" style={styles.icon}>
        {icon}
      </AppText>

      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.label}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {mode === 'toggle' ? (
        <Switch
          value={enabled}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      ) : (
        <View style={styles.navigateTrailing}>
          {valueLabel ? (
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {valueLabel}
            </AppText>
          ) : null}
          <AppText variant="bodyMedium" color="textSecondary">
            ›
          </AppText>
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
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 28,
    textAlign: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  navigateTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '42%',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 44,
  },
});
