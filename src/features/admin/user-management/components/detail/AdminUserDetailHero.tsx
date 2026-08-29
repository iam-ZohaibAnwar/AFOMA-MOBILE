import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../product-management/components/AdminProductStatusChip';
import type { AdminUserListItem } from '../../types/adminUserManagement';
import {
  formatAdminUserDisplayName,
  getAdminUserInitials,
  resolveAdminUserAvatarUrl,
  resolveAdminUserListStatusChips,
} from '../../utils/adminUserDisplay';
import { getAdminUserHeaderEmail } from '../../utils/adminUserDetailDisplay';

export interface AdminUserDetailHeroProps {
  user: AdminUserListItem;
  isRefreshing?: boolean;
  error?: string | null;
}

export function AdminUserDetailHero({ user, isRefreshing, error }: AdminUserDetailHeroProps) {
  const avatarUrl = resolveAdminUserAvatarUrl(user);
  const displayName = formatAdminUserDisplayName(user);
  const statusChips = resolveAdminUserListStatusChips(user);

  return (
    <View style={styles.wrap}>
      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <AppText variant="h3" style={styles.initials}>
                {getAdminUserInitials(user)}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.profileCopy}>
          <AppText variant="h3" style={styles.name}>
            {displayName}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
            {getAdminUserHeaderEmail(user)}
          </AppText>
        </View>
      </View>

      {statusChips.length > 0 ? (
        <View style={styles.chipRow}>
          {statusChips.map((chip) => (
            <AdminProductStatusChip
              key={chip.id}
              label={chip.label}
              icon={chip.icon as keyof typeof Ionicons.glyphMap}
              tone={chip.tone}
            />
          ))}
        </View>
      ) : null}

      {isRefreshing ? (
        <AppText variant="caption" color="textSecondary">
          Refreshing user details...
        </AppText>
      ) : null}

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontSize: 24,
    lineHeight: 28,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
