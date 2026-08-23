import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface AccountMenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
  destructive?: boolean;
}

export function AccountMenuRow({
  icon,
  label,
  onPress,
  showDivider = true,
  destructive = false,
}: AccountMenuRowProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={styles.icon}>
          {icon}
        </AppText>
        <AppText
          variant="bodyMedium"
          style={[styles.label, destructive && styles.destructiveLabel]}
        >
          {label}
        </AppText>
        {!destructive ? (
          <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
            ›
          </AppText>
        ) : null}
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
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
  },
  icon: {
    width: 24,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 22,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
  destructiveLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginLeft: 36,
  },
});
