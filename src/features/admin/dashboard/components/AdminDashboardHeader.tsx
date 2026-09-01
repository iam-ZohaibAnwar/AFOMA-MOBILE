import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '../../../../components/ui/HeaderBackButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';

export interface AdminDashboardHeaderProps {
  alertCount?: number;
  onBackPress?: () => void;
  onNotificationsPress?: () => void;
}

export function AdminDashboardHeader({
  alertCount = 0,
  onBackPress,
  onNotificationsPress,
}: AdminDashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const showBadge = alertCount > 0;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.backWrap}>
        <HeaderBackButton onPress={onBackPress} />
      </View>

      <AppText variant="h3" style={styles.title}>
        Dashboard
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Operational alerts"
        onPress={onNotificationsPress}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={adminDashboardTheme.iconButtonColor} />
        {showBadge ? (
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {alertCount > 9 ? '9+' : String(alertCount)}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: adminDashboardTheme.headerBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: adminDashboardTheme.cardBorder,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminDashboardTheme.iconButtonBackground,
  },
  backWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
