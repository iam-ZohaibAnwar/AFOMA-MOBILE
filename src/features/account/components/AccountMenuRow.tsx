import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { AccountMenuIcon, type AccountMenuIconName } from './AccountMenuIcon';

export interface AccountMenuRowProps {
  icon: AccountMenuIconName;
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
  const iconColor = destructive ? colors.error : colors.textPrimary;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <AccountMenuIcon name={icon} color={iconColor} size={20} />
        </View>

        <AppText
          variant="bodyMedium"
          style={[styles.label, destructive && styles.destructiveLabel]}
        >
          {label}
        </AppText>

        {!destructive ? (
          <ChevronForwardIcon color={colors.textMuted} size={18} />
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
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
  destructiveLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginLeft: 36,
  },
});
