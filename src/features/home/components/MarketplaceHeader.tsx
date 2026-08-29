import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { UserAvatarCircle } from '../../../components/ui/UserAvatarCircle';
import { AppText } from '../../../components/ui/AppText';
import { SearchIcon } from '../../../components/ui/SearchIcon';
import {
  colors,
  layout,
  radius,
  screenPaddingHorizontal,
  spacing,
} from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';

export interface MarketplaceHeaderProps {
  onProfilePress: () => void;
  onSearchPress: () => void;
  onNotificationsPress?: () => void;
  notificationUnreadCount?: number;
}

function getGreetingName(firstName?: string, email?: string): string {
  if (firstName?.trim()) {
    return firstName.trim();
  }

  const emailPrefix = email?.split('@')[0]?.trim();
  return emailPrefix || 'there';
}

export function MarketplaceHeader({
  onProfilePress,
  onSearchPress,
  onNotificationsPress,
  notificationUnreadCount = 0,
}: MarketplaceHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const greetingName = isAuthenticated
    ? getGreetingName(user?.firstName, user?.email)
    : 'Guest';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <View style={styles.leadingBlock}>
          <UserAvatarCircle
            user={user}
            isAuthenticated={isAuthenticated}
            onPress={onProfilePress}
            accessibilityLabel={isAuthenticated ? 'Open account' : 'Sign in'}
          />

          <View style={styles.greetingBlock}>
            <AppText variant="bodyMedium" style={styles.greetingTitle}>
              Hi, {greetingName}
            </AppText>
            <AppText variant="bodySmall" color="textMuted">
              Let&apos;s go shopping
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search products"
            onPress={onSearchPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <SearchIcon color={colors.textSecondary} size={24} />
          </Pressable>
          {onNotificationsPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                notificationUnreadCount > 0
                  ? `Notifications, ${notificationUnreadCount} unread`
                  : 'Notifications'
              }
              onPress={onNotificationsPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <View style={styles.bellWrap}>
                <Ionicons
                  name={notificationUnreadCount > 0 ? 'notifications' : 'notifications-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
                {notificationUnreadCount > 0 ? (
                  <View style={styles.badge}>
                    <AppText variant="caption" style={styles.badgeText}>
                      {notificationUnreadCount > 9 ? '9+' : String(notificationUnreadCount)}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leadingBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  greetingBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  greetingTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  bellWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
