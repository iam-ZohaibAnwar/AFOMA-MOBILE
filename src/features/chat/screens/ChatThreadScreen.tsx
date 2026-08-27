import { useEffect, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { useChatInbox } from '../hooks/useChatInbox';
import { useChatThread } from '../hooks/useChatThread';
import { resolveChatUserId } from '../utils/resolveChatUserId';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ChatThread'>;

const CHAT_THREAD_RETURN_TO = authReturnTo.messages();

export function ChatThreadScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList>(null);
  const { user, role } = useAuth();
  const chatUserId = resolveChatUserId(user);
  const { isAuthorized } = useRequireAuth(CHAT_THREAD_RETURN_TO);
  const { chatId, receiverId } = route.params;
  const { chats } = useChatInbox(isAuthorized ? chatUserId : undefined);

  const {
    title,
    messages,
    hasLoadedOnce,
    isSending,
    error,
    sendMessage,
  } = useChatThread({
    userId: isAuthorized ? chatUserId : undefined,
    chatId,
    receiverId,
    inboxChats: chats,
    viewerRole: role ?? user?.userRole,
  });

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  useEffect(() => {
    if (!hasLoadedOnce || messages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [hasLoadedOnce, messages.length]);

  if (!isAuthorized || !chatUserId) {
    return <View style={styles.screen} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatMessageBubble message={item} isOwn={item.sender === chatUserId} />
        )}
        contentContainerStyle={[
          styles.messagesContent,
          messages.length === 0 ? styles.messagesEmpty : null,
          { paddingBottom: spacing.md },
        ]}
        ListEmptyComponent={
          hasLoadedOnce ? (
            <View style={styles.emptyState}>
              <AppText variant="body" style={styles.emptyText}>
                Say hello to start the conversation.
              </AppText>
            </View>
          ) : null
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <AppText variant="caption" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}

      <View style={{ paddingBottom: insets.bottom }}>
        <ChatComposer onSend={sendMessage} isSending={isSending} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  messagesEmpty: {
    justifyContent: 'center',
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  errorText: {
    color: colors.error,
  },
});
