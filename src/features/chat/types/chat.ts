export interface ChatParticipant {
  _id?: string;
  name?: string;
  email?: string;
  storeTitle?: string;
  firstName?: string;
  userRole?: string;
  userProfile?: string;
  missing?: boolean;
}

export interface ChatAttachment {
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}

export interface ChatLastMessage {
  _id?: string;
  sender?: string;
  text?: string;
  attachments?: ChatAttachment[];
  createdAt?: string;
  readBy?: string[];
}

export interface ChatSummary {
  _id: string;
  participants: Array<ChatParticipant | string>;
  lastMessage?: ChatLastMessage | null;
  unreadCount?: number;
  unreadCounts?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
  isTemp?: boolean;
  receiverId?: string;
}

export interface ChatMessage {
  _id: string;
  chatId?: string;
  sender: string;
  text?: string;
  attachments?: ChatAttachment[];
  createdAt: string;
  readBy?: string[];
  deliveredTo?: string[];
  reactions?: Array<{ user: string; type: string }>;
  isDeleted?: boolean;
  edited?: boolean;
  optimistic?: boolean;
  failed?: boolean;
}

export interface SendMessageAck {
  status: 'ok' | 'error';
  message?: ChatMessage;
  chatId?: string;
  error?: string;
}
