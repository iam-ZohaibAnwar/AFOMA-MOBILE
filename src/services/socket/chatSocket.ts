// Bundled build — Metro cannot resolve engine.io-client ESM transport subpaths in RN.
import io from 'socket.io-client/dist/socket.io.js';
import type { Socket } from 'socket.io-client';

import { env } from '../../app/config/env';
import type { ChatMessage, SendMessageAck } from '../../features/chat/types/chat';

let socket: Socket | null = null;
let joinedUserId: string | null = null;

function normalizeSocketUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\/[^/]+/.test(trimmed)) {
    return trimmed.replace(/\/$/, '');
  }

  if (/^https?:[^/]/.test(trimmed)) {
    return trimmed.replace(/^(https?):/, '$1://').replace(/\/$/, '');
  }

  return undefined;
}

function getSocketUrl(): string | undefined {
  return normalizeSocketUrl(env.socketUrl || env.apiUrl);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function connectChatSocket(userId: string): Socket | null {
  const socketUrl = getSocketUrl();
  if (!socketUrl || !userId) {
    return null;
  }

  if (!socket) {
    socket = io(socketUrl, {
      extraHeaders: env.apiKey ? { 'x-api-key': env.apiKey } : undefined,
      autoConnect: false,
      // Match web: polling first, then upgrade. WebSocket-only often fails behind nginx on RN.
      transports: ['polling', 'websocket'],
      connectTimeout: 10000,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
    });
  }

  const emitJoin = () => {
    socket?.emit('join', { userId });
  };

  socket.off('connect');
  socket.on('connect', emitJoin);

  joinedUserId = userId;

  if (!socket.connected) {
    socket.connect();
  } else {
    emitJoin();
  }

  return socket;
}

export async function ensureChatSocketConnected(
  maxAttempts = 12,
  delayMs = 250,
): Promise<Socket | null> {
  const activeSocket = socket;
  if (!activeSocket) {
    return null;
  }

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  let attempts = 0;
  while (attempts < maxAttempts) {
    if (activeSocket.connected) {
      return activeSocket;
    }

    await sleep(delayMs);
    attempts += 1;
  }

  return activeSocket.connected ? activeSocket : null;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    if (socket.connected) {
      socket.disconnect();
    }
    socket = null;
  }

  joinedUserId = null;
}

export function joinChatRoom(chatId: string): void {
  if (!chatId) {
    return;
  }

  socket?.emit('join_chat', { chatId });
}

export async function sendChatMessage(payload: {
  chatId: string;
  senderId: string;
  text: string;
  participants: string[];
  attachments?: ChatMessage['attachments'];
}): Promise<SendMessageAck> {
  const activeSocket = await ensureChatSocketConnected();
  if (!activeSocket?.connected) {
    return { status: 'error', error: 'Chat connection unavailable' };
  }

  return new Promise((resolve) => {
    activeSocket.emit('send_message', payload, (response: SendMessageAck) => {
      resolve(response ?? { status: 'error', error: 'No response from server' });
    });
  });
}

export function markChatMessageRead(payload: {
  messageId: string;
  userId: string;
  chatId: string;
}): void {
  socket?.emit('message_read', payload);
}

export function getJoinedChatUserId(): string | null {
  return joinedUserId;
}
