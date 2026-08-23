import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { AuthUser } from '../../auth/types';
import {
  getAccountDisplayName,
  getAccountEmail,
  getAccountInitials,
} from '../utils/accountDisplay';

export interface AccountProfileHeaderProps {
  user: AuthUser | null;
  onEditPress?: () => void;
}

export function AccountProfileHeader({ user, onEditPress }: AccountProfileHeaderProps) {
  const content = (
    <>
      <View style={styles.avatar}>
        <AppText variant="h2" color="primary" style={styles.initials}>
          {getAccountInitials(user)}
        </AppText>
      </View>

      <View style={styles.info}>
        <AppText variant="h3">{getAccountDisplayName(user)}</AppText>
        <AppText variant="bodySmall" color="textMuted" numberOfLines={1}>
          {getAccountEmail(user)}
        </AppText>
      </View>

      {onEditPress ? (
        <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
          ›
        </AppText>
      ) : null}
    </>
  );

  if (!onEditPress) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Account details"
      onPress={onEditPress}
      style={({ pressed }) => [styles.container, styles.profileCard, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 22,
    lineHeight: 26,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.94,
  },
});
