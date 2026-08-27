import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchUserChats } from '../api/chatApi';
import type { ChatSummary } from '../types/chat';
import {
  getChatInboxCache,
  setChatInboxCache,
} from '../../../services/cache/screenCache';
import { connectChatSocket, getChatSocket } from '../../../services/socket/chatSocket';
import { getErrorMessage } from '../../../services/api/errors';

function hydrateInbox(userId?: string) {
  if (!userId) {
    return {
      chats: [] as ChatSummary[],
      hasLoadedOnce: false,
      isRefreshing: false,
    };
  }

  const cached = getChatInboxCache(userId);
  if (!cached) {
    return {
      chats: [] as ChatSummary[],
      hasLoadedOnce: false,
      isRefreshing: true,
    };
  }

  return {
    chats: cached,
    hasLoadedOnce: true,
    isRefreshing: true,
  };
}

export function useChatInbox(userId?: string) {
  const initial = useMemo(() => hydrateInbox(userId), [userId]);
  const requestVersionRef = useRef(0);

  const [chats, setChats] = useState<ChatSummary[]>(initial.chats);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(initial.hasLoadedOnce);
  const [isRefreshing, setIsRefreshing] = useState(initial.isRefreshing);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setChats([]);
      setHasLoadedOnce(false);
      setIsRefreshing(false);
      return;
    }

    const version = requestVersionRef.current + 1;
    requestVersionRef.current = version;
    setIsRefreshing(true);
    setError(null);

    connectChatSocket(userId);

    try {
      const nextChats = await fetchUserChats(userId);
      if (requestVersionRef.current !== version) {
        return;
      }

      setChats(nextChats);
      setChatInboxCache(userId, nextChats);
      setHasLoadedOnce(true);
    } catch (caught) {
      if (requestVersionRef.current !== version) {
        return;
      }

      setError(getErrorMessage(caught, 'Could not load messages'));
    } finally {
      if (requestVersionRef.current === version) {
        setIsRefreshing(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = connectChatSocket(userId);
    if (!socket) {
      return;
    }

    const handleNewMessage = (message: ChatSummary['lastMessage'] & { chatId?: string; unreadCount?: number }) => {
      if (!message?.chatId) {
        return;
      }

      setChats((current) => {
        const index = current.findIndex((chat) => chat._id === message.chatId);
        if (index === -1) {
          void refresh();
          return current;
        }

        const next = [...current];
        const existing = next[index];
        next[index] = {
          ...existing,
          lastMessage: {
            _id: message._id,
            sender: message.sender,
            text: message.text,
            attachments: message.attachments,
            createdAt: message.createdAt,
            readBy: message.readBy,
          },
          unreadCount: message.unreadCount ?? existing.unreadCount,
          updatedAt: message.createdAt ?? existing.updatedAt,
        };

        next.sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? a.lastMessage?.createdAt ?? 0).getTime();
          const bTime = new Date(b.updatedAt ?? b.lastMessage?.createdAt ?? 0).getTime();
          return bTime - aTime;
        });

        setChatInboxCache(userId, next);
        return next;
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [refresh, userId]);

  return {
    chats,
    hasLoadedOnce,
    isRefreshing,
    error,
    refresh,
  };
}

export function useChatInboxSnapshot(userId?: string) {
  return useMemo(() => (userId ? getChatInboxCache(userId) : undefined), [userId]);
}
