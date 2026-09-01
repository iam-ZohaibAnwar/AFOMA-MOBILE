import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  KeyboardStickyView,
  useKeyboardState,
  useResizeMode,
} from 'react-native-keyboard-controller';
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
const COMPOSER_FALLBACK_HEIGHT = 72;

export function ChatThreadScreen({ route, navigation }: Props) {
  useResizeMode();

  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const { user, role } = useAuth();
  const chatUserId = resolveChatUserId(user);
  const { isAuthorized } = useRequireAuth(CHAT_THREAD_RETURN_TO);
  const { chatId, receiverId } = route.params;
  const { chats } = useChatInbox(isAuthorized ? chatUserId : undefined);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_FALLBACK_HEIGHT);
  const keyboardHeight = useKeyboardState((state) => state.height);

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

  const bottomInset = keyboardHeight > 0 ? keyboardHeight : insets.bottom;
  const listBottomInset = composerHeight + bottomInset;

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const scrollToLatestMessage = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedOnce || messages.length === 0) {
      return;
    }

    scrollToLatestMessage(true);
  }, [hasLoadedOnce, messages.length, scrollToLatestMessage]);

  useEffect(() => {
    if (keyboardHeight <= 0 || messages.length === 0) {
      return;
    }

    scrollToLatestMessage(true);
  }, [keyboardHeight, messages.length, scrollToLatestMessage]);

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setComposerHeight(nextHeight);
    }
  }, []);

  if (!isAuthorized || !chatUserId) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
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
          { paddingBottom: spacing.md + listBottomInset },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
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
            scrollToLatestMessage(false);
          }
        }}
      />

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View
          onLayout={handleComposerLayout}
          style={[
            styles.composerWrap,
            keyboardHeight <= 0 ? { paddingBottom: insets.bottom } : null,
          ]}
        >
          {error ? (
            <View style={styles.errorBanner}>
              <AppText variant="caption" style={styles.errorText}>
                {error}
              </AppText>
            </View>
          ) : null}

          <ChatComposer onSend={sendMessage} isSending={isSending} />
        </View>
      </KeyboardStickyView>
    </View>
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
  composerWrap: {
    backgroundColor: colors.background,
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
