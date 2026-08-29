import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveChatUserId } from '../utils/resolveChatUserId';
import { ChatListItem } from '../components/ChatListItem';
import { useChatInbox } from '../hooks/useChatInbox';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChatList'>;

const CHAT_LIST_RETURN_TO = authReturnTo.messages();

export function ChatListScreen({ navigation }: Props) {
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { user, role } = useAuth();
  const chatUserId = resolveChatUserId(user);
  const { isAuthorized } = useRequireAuth(CHAT_LIST_RETURN_TO);
  const { chats, hasLoadedOnce, isRefreshing, error, refresh } = useChatInbox(
    isAuthorized ? chatUserId : undefined,
  );

  if (!isAuthorized || !chatUserId) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        onScroll={onMarketplaceScroll}
        {...marketplaceScrollProps}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            myId={chatUserId}
            myRole={role ?? user?.userRole}
            onPress={() =>
              navigation.navigate('ChatThread', {
                chatId: item._id,
              })
            }
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
        contentContainerStyle={chats.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          hasLoadedOnce ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubbles-outline" size={28} color={colors.textInverse} />
              </View>
              <AppText variant="h3" style={styles.emptyTitle}>
                No messages yet
              </AppText>
              <AppText variant="body" style={styles.emptyBody}>
                Message a seller from any product page to start a conversation.
              </AppText>
            </View>
          ) : null
        }
      />

      {error ? (
        <View style={styles.errorBanner}>
          <AppText variant="caption" style={styles.errorText}>
            {error}
          </AppText>
          <AppButton label="Retry" variant="outline" onPress={() => void refresh()} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
  },
});
