import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { MenuIcon } from '../../../components/ui/MenuIcon';
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
  onMenuPress: () => void;
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

export function MarketplaceHeader({
  onMenuPress,
  onSearchPress,
  onNotificationsPress,
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open categories menu"
            onPress={onMenuPress}
            hitSlop={8}
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
          >
            <MenuIcon color={colors.textPrimary} size={24} />
          </Pressable>

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
  leadingBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  menuButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
});
