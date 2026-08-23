import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import {
  colors,
  layout,
  radius,
  screenPaddingHorizontal,
  spacing,
} from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';

export interface MarketplaceHeaderProps {
  onSearchPress: () => void;
  onNotificationsPress?: () => void;
}

function getGreetingName(firstName?: string, email?: string): string {
  if (firstName?.trim()) {
    return firstName.trim();
  }

  const emailPrefix = email?.split('@')[0]?.trim();
  return emailPrefix || 'there';
}

function getInitials(firstName?: string, email?: string): string {
  const name = getGreetingName(firstName, email);
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function MarketplaceHeader({
  onSearchPress,
  onNotificationsPress,
}: MarketplaceHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const greetingName = isAuthenticated
    ? getGreetingName(user?.firstName, user?.email)
    : 'Guest';
  const avatarInitials = isAuthenticated
    ? getInitials(user?.firstName, user?.email)
    : 'GU';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <AppText variant="label" color="primary">
              {avatarInitials}
            </AppText>
          </View>
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
            <AppText variant="bodyMedium" color="textSecondary">
              ⌕
            </AppText>
          </Pressable>
          {onNotificationsPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={onNotificationsPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <AppText variant="bodyMedium" color="textSecondary">
                🔔
              </AppText>
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
  profileBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBlock: {
    flex: 1,
    gap: 2,
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
});
