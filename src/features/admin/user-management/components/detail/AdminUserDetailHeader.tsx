import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../../components/ui/AppBadge';
import { AppButton } from '../../../../../components/ui/AppButton';
import { AppCard } from '../../../../../components/ui/AppCard';
import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import type { AdminUserListItem } from '../../types/adminUserManagement';
import {
  adminUserRoleBadgeVariant,
  getAdminUserHeaderEmail,
  getAdminUserInitials,
  getAdminUserRoleLabel,
} from '../../utils/adminUserDetailDisplay';
import {
  formatAdminUserDisplayName,
  getAdminUserFullAccessBadgeLabel,
} from '../../utils/adminUserRoleOptions';

export interface AdminUserDetailHeaderProps {
  user: AdminUserListItem;
  isRefreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditPress?: () => void;
}

function AdminUserAvatar({
  user,
  profileUri,
}: {
  user: AdminUserListItem;
  profileUri?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (profileUri && !imageFailed) {
    return (
      <Image
        source={{ uri: profileUri }}
        style={styles.avatarImage}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <AppText variant="h3" color="primary" style={styles.initials}>
        {getAdminUserInitials(user)}
      </AppText>
    </View>
  );
}

export function AdminUserDetailHeader({
  user,
  isRefreshing,
  error,
  onRetry,
  onEditPress,
}: AdminUserDetailHeaderProps) {
  const profileUri = user.userProfile?.trim();
  const fullAccessBadge = getAdminUserFullAccessBadgeLabel(user);

  return (
    <AppCard style={styles.card}>
      <View style={styles.identityRow}>
        <AdminUserAvatar user={user} profileUri={profileUri} />

        <View style={styles.identityCopy}>
          <AppText variant="h3" style={styles.name}>
            {formatAdminUserDisplayName(user)}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
            {getAdminUserHeaderEmail(user)}
          </AppText>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <AppBadge
          label={getAdminUserRoleLabel(user)}
          variant={adminUserRoleBadgeVariant(user.userRole)}
        />
        {fullAccessBadge ? (
          <AppBadge
            label={fullAccessBadge}
            variant={user.fullAccess ? 'warning' : 'neutral'}
          />
        ) : null}
      </View>

      {isRefreshing ? (
        <AppText variant="caption" color="textSecondary">
          Refreshing user details...
        </AppText>
      ) : null}

      {error && onRetry ? (
        <AppButton label="Retry" variant="outline" onPress={onRetry} />
      ) : null}

      {onEditPress ? (
        <AppButton label="Edit user" variant="primary" onPress={onEditPress} />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    lineHeight: 28,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
