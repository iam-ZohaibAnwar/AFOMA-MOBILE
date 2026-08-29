import { StyleSheet, View } from 'react-native';

import { MarketplaceHeader } from './MarketplaceHeader';
import { colors } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useBellNotifications } from '../../notifications/hooks/useBellNotifications';

export interface MarketplaceTopChromeProps {
  onProfilePress: () => void;
  onSearchPress: () => void;
  onNotificationsPress?: () => void;
}

export function MarketplaceTopChrome({
  onProfilePress,
  onSearchPress,
  onNotificationsPress,
}: MarketplaceTopChromeProps) {
  const { isAuthenticated, user } = useAuth();
  const userId = resolveAuthUserId(user);
  const { unreadCount } = useBellNotifications({
    userId: isAuthenticated ? userId : undefined,
    enabled: isAuthenticated,
  });

  return (
    <View style={styles.container}>
      <MarketplaceHeader
        onProfilePress={onProfilePress}
        onSearchPress={onSearchPress}
        onNotificationsPress={onNotificationsPress}
        notificationUnreadCount={unreadCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
