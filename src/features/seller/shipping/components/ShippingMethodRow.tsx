import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronForwardIcon } from '../../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

const ICON_SIZE = 40;

export interface ShippingMethodRowProps {
  icon: keyof typeof Ionicons.glyphMap;
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
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.textInverse} />
      </View>

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
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.pill,
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
  label: {
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
    backgroundColor: colors.border,
    marginLeft: ICON_SIZE + spacing.md,
  },
});
