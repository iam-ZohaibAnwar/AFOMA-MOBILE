import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '../../../../components/ui/HeaderBackButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { sellerDashboardTheme } from '../utils/sellerDashboardTheme';

export interface SellerDashboardHeaderProps {
  shopName?: string;
  alertCount?: number;
  onBackPress?: () => void;
  onAlertsPress?: () => void;
}

export function SellerDashboardHeader({
  shopName,
  alertCount = 0,
  onBackPress,
  onAlertsPress,
}: SellerDashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const showBadge = alertCount > 0;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.backWrap}>
        <HeaderBackButton onPress={onBackPress} />
      </View>

      <View style={styles.titleBlock}>
        <AppText variant="h3" style={styles.title} numberOfLines={1}>
          Dashboard
        </AppText>
        {shopName ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {shopName}
          </AppText>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Shop alerts"
        onPress={onAlertsPress}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={sellerDashboardTheme.iconButtonColor} />
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
    backgroundColor: sellerDashboardTheme.headerBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sellerDashboardTheme.cardBorder,
  },
  backWrap: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sellerDashboardTheme.iconButtonBackground,
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
