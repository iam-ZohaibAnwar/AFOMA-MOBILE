import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchChatMessages } from '../api/chatApi';
import type { ChatMessage, ChatSummary } from '../types/chat';
import {
  buildTempChat,
  findExistingChatWithReceiver,
  getParticipantId,
  isTempChatId,
  normalizeParticipantIds,
} from '../utils/chatDisplay';
import {
  connectChatSocket,
  getChatSocket,
  joinChatRoom,
  markChatMessageRead,
  sendChatMessage,
} from '../../../services/socket/chatSocket';
import { getErrorMessage } from '../../../services/api/errors';

interface UseChatThreadOptions {
  userId?: string;
  chatId?: string;
  receiverId?: string;
  inboxChats?: ChatSummary[];
  viewerRole?: string;
}

function createOptimisticMessage(chatId: string, senderId: string, text: string): ChatMessage {
  return {
    _id: `local-${Date.now()}`,
    chatId,
    sender: senderId,
    text,
    createdAt: new Date().toISOString(),
    readBy: [senderId],
    optimistic: true,
    failed: false,
  };
}

export function useChatThread(options: UseChatThreadOptions) {
  const { userId, chatId, receiverId, inboxChats = [], viewerRole } = options;

  const resolvedChat = useMemo(() => {
    if (!userId) {
      return undefined;
    }

    if (chatId && !isTempChatId(chatId)) {
      return inboxChats.find((chat) => chat._id === chatId);
    }

    if (receiverId) {
      const existing = findExistingChatWithReceiver(inboxChats, userId, receiverId);
      if (existing) {
        return existing;
      }

      return buildTempChat(userId, receiverId);
    }

    if (chatId && isTempChatId(chatId)) {
      return inboxChats.find((item) => item._id === chatId) ?? buildTempChat(userId, chatId.split('-').slice(2).join('-'));
    }

    return undefined;
  }, [chatId, inboxChats, receiverId, userId]);

  const activeChatId = resolvedChat?._id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(activeChatId));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const refreshMessages = useCallback(async () => {
    if (!userId || !activeChatId) {
      setMessages([]);
      setHasLoadedOnce(false);
      setIsRefreshing(false);
      return;
    }

    if (isTempChatId(activeChatId)) {
      setMessages([]);
      setHasLoadedOnce(true);
      setIsRefreshing(false);
      return;
    }

    const version = requestVersionRef.current + 1;
    requestVersionRef.current = version;
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetchChatMessages(activeChatId);
      if (requestVersionRef.current !== version) {
        return;
      }

      setMessages(Array.isArray(response.messages) ? response.messages : []);
      setHasLoadedOnce(true);
    } catch (caught) {
      if (requestVersionRef.current !== version) {
        return;
      }

      setError(getErrorMessage(caught, 'Could not load conversation'));
    } finally {
      if (requestVersionRef.current === version) {
        setIsRefreshing(false);
      }
    }
  }, [activeChatId, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    connectChatSocket(userId);
  }, [userId]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    joinChatRoom(activeChatId);
    void refreshMessages();
  }, [activeChatId, refreshMessages]);

  useEffect(() => {
    if (!userId || !activeChatId) {
      return;
    }

    const socket = getChatSocket();
    if (!socket) {
      return;
    }

    const handleNewMessage = (message: ChatMessage & { chatId?: string }) => {
      const incomingChatId = message.chatId;
      if (!incomingChatId) {
        return;
      }

      const matchesActiveChat =
        incomingChatId === activeChatId || (isTempChatId(activeChatId) && message.sender !== userId);

      if (!matchesActiveChat && !isTempChatId(activeChatId)) {
        return;
      }

      if (isTempChatId(activeChatId) && incomingChatId !== activeChatId) {
        joinChatRoom(incomingChatId);
      }

      setMessages((current) => {
        const withoutMatchingOptimistic = current.filter(
          (item) => !(item.optimistic && item.text === message.text && item.sender === message.sender),
        );

        if (withoutMatchingOptimistic.some((item) => item._id === message._id)) {
          return withoutMatchingOptimistic;
        }

        return [...withoutMatchingOptimistic, { ...message, chatId: incomingChatId }];
      });

      if (message.sender !== userId && message._id) {
        markChatMessageRead({
          messageId: message._id,
          userId,
          chatId: incomingChatId,
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [activeChatId, userId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !userId || !resolvedChat || isSending) {
        return false;
      }

      const participants = normalizeParticipantIds(resolvedChat.participants);
      if (!participants.length && resolvedChat.receiverId) {
        participants.push(userId, resolvedChat.receiverId);
      }

      const optimistic = createOptimisticMessage(resolvedChat._id, userId, trimmed);
      setMessages((current) => [...current, optimistic]);
      setIsSending(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          chatId: resolvedChat._id,
          senderId: userId,
          text: trimmed,
          participants,
        });

        if (response.status !== 'ok' || !response.message) {
          throw new Error(response.error || 'Message failed to send');
        }

        const realChatId = response.chatId ?? response.message.chatId ?? resolvedChat._id;
        joinChatRoom(realChatId);

        setMessages((current) => {
          const withoutOptimistic = current.filter((item) => item._id !== optimistic._id);
          if (withoutOptimistic.some((item) => item._id === response.message!._id)) {
            return withoutOptimistic;
          }

          return [
            ...withoutOptimistic,
            {
              ...response.message!,
              chatId: realChatId,
            },
          ];
        });

        return true;
      } catch (caught) {
        setMessages((current) =>
          current.map((item) =>
            item._id === optimistic._id
              ? {
                  ...item,
                  optimistic: false,
                  failed: true,
                }
              : item,
          ),
        );
        setError(getErrorMessage(caught, 'Message failed to send'));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isSending, resolvedChat, userId],
  );

  const title = useMemo(() => {
    if (!resolvedChat || !userId) {
      return 'Messages';
    }

    const other = resolvedChat.participants.find(
      (participant) => getParticipantId(participant) !== userId,
    );

    if (typeof other === 'object' && other) {
      if (viewerRole === 'seller' || other.userRole === 'seller') {
        return other.storeTitle?.trim() || other.firstName?.trim() || other.email?.trim() || 'Seller';
      }

      return other.firstName?.trim() || other.email?.trim() || 'Customer';
    }

    return 'Messages';
  }, [resolvedChat, userId, viewerRole]);

  return {
    chat: resolvedChat,
    chatId: activeChatId,
    title,
    messages,
    hasLoadedOnce,
    isRefreshing,
    isSending,
    error,
    refreshMessages,
    sendMessage,
  };
}
