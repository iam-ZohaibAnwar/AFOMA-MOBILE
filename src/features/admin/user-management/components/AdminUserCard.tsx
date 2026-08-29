import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';
import type { AdminUserListItem } from '../types/adminUserManagement';
import {
  formatAdminUserDisplayName,
  getAdminUserInitials,
  getAdminUserListSubtitle,
  resolveAdminUserAccentColor,
  resolveAdminUserAvatarUrl,
  resolveAdminUserListStatusChips,
} from '../utils/adminUserDisplay';

export interface AdminUserCardProps {
  user: AdminUserListItem;
  onPress: (user: AdminUserListItem) => void;
  onMenuPress: (user: AdminUserListItem) => void;
  isBusy?: boolean;
}

export function AdminUserCard({ user, onPress, onMenuPress, isBusy = false }: AdminUserCardProps) {
  const userId = user._id;
  const avatarUrl = resolveAdminUserAvatarUrl(user);
  const accentColor = resolveAdminUserAccentColor(user.userRole);
  const subtitle = getAdminUserListSubtitle(user);
  const statusChips = resolveAdminUserListStatusChips(user);
  const displayName = formatAdminUserDisplayName(user);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={!userId || isBusy}
        onPress={() => onPress(user)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <AppText variant="bodyMedium" style={styles.initials}>
                {getAdminUserInitials(user)}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <AppText variant="bodyMedium" style={styles.name} numberOfLines={1}>
            {displayName}
          </AppText>

          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>

          {statusChips.length > 0 ? (
            <View style={styles.chipsRow}>
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
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="User actions"
        disabled={!userId || isBusy}
        onPress={() => onMenuPress(user)}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        hitSlop={8}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.md + 28,
    minHeight: AVATAR_SIZE + spacing.md * 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  avatarWrap: {
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
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
});
