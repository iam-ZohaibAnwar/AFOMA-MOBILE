import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { AccountMenuIcon, type AccountMenuIconName } from './AccountMenuIcon';

export interface AccountMenuRowProps {
  icon: AccountMenuIconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function AccountMenuRow({
  icon,
  label,
  onPress,
  destructive = false,
}: AccountMenuRowProps) {
  const iconBackgroundColor = destructive ? colors.errorBg : colors.primary;
  const iconColor = destructive ? colors.error : colors.textInverse;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
  destructiveLabel: {
    color: colors.error,
    fontWeight: '600',
  },
});
