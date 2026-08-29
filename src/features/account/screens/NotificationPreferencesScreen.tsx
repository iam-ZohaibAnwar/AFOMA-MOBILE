import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveChatUserId } from '../../chat/utils/resolveChatUserId';
import { NotificationPreferenceRow } from '../components/NotificationPreferenceRow';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationPermissionStatus } from '../../../services/push/pushNotifications';
import {
  getPushUnsupportedMessage,
  getPushUnsupportedReason,
  type PushUnsupportedReason,
} from '../../../services/push/pushNativeSupport';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'NotificationPreferences'>;

const RETURN_TO = authReturnTo.notificationPreferences();

function formatPermissionStatus(
  status: NotificationPermissionStatus,
  unsupportedReason: PushUnsupportedReason | null,
): string {
  switch (status) {
    case 'granted':
      return 'Allowed';
    case 'denied':
      return 'Blocked';
    case 'unsupported':
      switch (unsupportedReason) {
        case 'simulator':
          return 'Simulator / emulator';
        case 'web':
          return 'Web not supported';
        case 'native_module':
          return 'Rebuild required';
        default:
          return 'Unavailable on this device';
      }
    default:
      return 'Not set — tap to allow';
  }
}

export function NotificationPreferencesScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { isAuthorized } = useRequireAuth(RETURN_TO);
  const { user } = useAuth();
  const chatUserId = resolveChatUserId(user);

  const {
    preferences,
    permissionStatus,
    isUpdating,
    error,
    refresh,
    setChatMessagesEnabled,
    setMarketplaceOffersEnabled,
    openSystemSettings,
    requestSystemPermission,
  } = useNotificationPreferences({
    userId: isAuthorized ? chatUserId : undefined,
    enabled: isAuthorized,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const toggleDisabled =
    isUpdating || permissionStatus === 'unsupported' || permissionStatus === 'denied';

  const unsupportedReason = permissionStatus === 'unsupported' ? getPushUnsupportedReason() : null;

  const handleSystemNotificationsPress = () => {
    if (permissionStatus === 'undetermined') {
      void requestSystemPermission();
      return;
    }

    void openSystemSettings();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
    >
      <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
        Control how AFOMA alerts you on this device.
      </AppText>

      <View style={styles.section}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          DEVICE PERMISSION
        </AppText>
        <AppCard variant="muted" style={styles.card}>
          <NotificationPreferenceRow
            icon="shield-checkmark-outline"
            title="System notifications"
            description="Required for alerts when the app is closed."
            mode="navigate"
            valueLabel={formatPermissionStatus(permissionStatus, unsupportedReason)}
            onPress={handleSystemNotificationsPress}
            showDivider={false}
          />
        </AppCard>

        {unsupportedReason ? (
          <AppText variant="caption" color="textSecondary">
            {getPushUnsupportedMessage(unsupportedReason)}
          </AppText>
        ) : null}

        {permissionStatus === 'denied' ? (
          <AppButton
            label="Open device settings"
            variant="outline"
            onPress={() => void openSystemSettings()}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          MESSAGE ALERTS
        </AppText>
        <AppCard variant="muted" style={styles.card}>
          <NotificationPreferenceRow
            icon="chatbubbles-outline"
            title="Chat messages"
            description="Get notified when someone sends you a marketplace message."
            mode="toggle"
            value={preferences.chatMessages && permissionStatus === 'granted'}
            disabled={toggleDisabled}
            onToggle={(enabled) => void setChatMessagesEnabled(enabled)}
            showDivider={false}
          />
        </AppCard>

        {permissionStatus === 'denied' ? (
          <AppText variant="caption" color="textSecondary">
            Enable notifications in device settings to turn on chat alerts.
          </AppText>
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          OFFERS & PROMOTIONS
        </AppText>
        <AppCard variant="muted" style={styles.card}>
          <NotificationPreferenceRow
            icon="pricetag-outline"
            title="Offers & promotions"
            description="Get notified about coupons, seller offers, and bell inbox alerts."
            mode="toggle"
            value={preferences.marketplaceOffers && permissionStatus === 'granted'}
            disabled={toggleDisabled}
            onToggle={(enabled) => void setMarketplaceOffersEnabled(enabled)}
            showDivider={false}
          />
        </AppCard>

        {permissionStatus === 'denied' ? (
          <AppText variant="caption" color="textSecondary">
            Enable notifications in device settings to turn on offer alerts.
          </AppText>
        ) : null}
      </View>

      <AppText variant="caption" color="textMuted">
        Order status updates can be added here in a future release.
      </AppText>

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.error} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  lead: {
    marginBottom: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  card: {
    paddingHorizontal: spacing.lg,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
