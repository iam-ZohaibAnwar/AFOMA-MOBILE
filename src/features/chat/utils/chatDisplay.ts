import type { ChatLastMessage, ChatParticipant, ChatSummary } from '../types/chat';

export function getParticipantId(participant: ChatParticipant | string | undefined): string {
  if (!participant) {
    return '';
  }

  if (typeof participant === 'string') {
    return participant;
  }

  return participant._id?.trim() ?? '';
}

export function getOtherParticipant(
  participants: Array<ChatParticipant | string> | undefined,
  myId: string,
): ChatParticipant | string | undefined {
  if (!participants?.length) {
    return undefined;
  }

  return participants.find((participant) => getParticipantId(participant) !== myId) ?? participants[0];
}

export function getParticipantDisplayName(
  participant: ChatParticipant | string | undefined,
  viewerRole?: string,
): string {
  if (!participant || typeof participant === 'string') {
    return 'Chat';
  }

  if (viewerRole === 'seller' || participant.userRole === 'seller') {
    return participant.storeTitle?.trim() || participant.firstName?.trim() || participant.email?.trim() || 'Seller';
  }

  return participant.firstName?.trim() || participant.email?.trim() || participant.storeTitle?.trim() || 'Customer';
}

export function getChatTitle(chat: ChatSummary, myId: string, myRole?: string): string {
  const receiver = getOtherParticipant(chat.participants, myId);
  return getParticipantDisplayName(receiver, myRole);
}

export function getLastMessagePreview(lastMessage?: ChatLastMessage | null): string {
  if (!lastMessage) {
    return 'Start the conversation…';
  }

  if (lastMessage.text?.trim()) {
    return lastMessage.text.trim();
  }

  if (lastMessage.attachments?.length) {
    return '[Attachment]';
  }

  return 'Start the conversation…';
}

export function buildTempChatId(userId: string, receiverId: string): string {
  return `temp-${userId}-${receiverId}`;
}

export function isTempChatId(chatId?: string): boolean {
  return Boolean(chatId?.startsWith('temp-'));
}

export function normalizeParticipantIds(
  participants: Array<ChatParticipant | string> | undefined,
): string[] {
  if (!participants?.length) {
    return [];
  }

  return participants
    .map((participant) => getParticipantId(participant))
    .filter(Boolean);
}

export function findExistingChatWithReceiver(
  chats: ChatSummary[],
  userId: string,
  receiverId: string,
): ChatSummary | undefined {
  const receiver = receiverId.trim();
  const me = userId.trim();

  return chats.find((chat) => {
    const ids = normalizeParticipantIds(chat.participants);
    return ids.includes(me) && ids.includes(receiver);
  });
}

export function buildTempChat(userId: string, receiverId: string): ChatSummary {
  return {
    _id: buildTempChatId(userId, receiverId),
    participants: [userId, receiverId],
    lastMessage: { text: 'Start the conversation…', createdAt: new Date().toISOString() },
    unreadCount: 0,
    isTemp: true,
    receiverId,
  };
}
