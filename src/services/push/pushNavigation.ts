import { marketplaceNavigationRef } from '../../app/navigation/marketplaceChrome/marketplaceNavigationRef';

type PendingChatNavigation = {
  chatId?: string;
  senderId?: string;
};

let pendingChatNavigation: PendingChatNavigation | null = null;
let pendingBellNavigation = false;
let retryTimer: ReturnType<typeof setInterval> | null = null;

function clearRetryTimer() {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}

function attemptChatNavigation(target: PendingChatNavigation): boolean {
  if (!marketplaceNavigationRef.isReady()) {
    return false;
  }

  marketplaceNavigationRef.navigate('Shopping', {
    screen: 'ChatThread',
    params: target.chatId
      ? { chatId: target.chatId }
      : target.senderId
        ? { receiverId: target.senderId }
        : {},
  });

  pendingChatNavigation = null;
  pendingBellNavigation = false;
  clearRetryTimer();
  return true;
}

function scheduleChatNavigation(target: PendingChatNavigation) {
  pendingChatNavigation = target;
  pendingBellNavigation = false;

  if (attemptChatNavigation(target)) {
    return;
  }

  clearRetryTimer();
  let attempts = 0;
  retryTimer = setInterval(() => {
    attempts += 1;
    if (attemptChatNavigation(target) || attempts >= 30) {
      clearRetryTimer();
    }
  }, 100);
}

function attemptBellNavigation(): boolean {
  if (!marketplaceNavigationRef.isReady()) {
    return false;
  }

  marketplaceNavigationRef.navigate('Shopping', {
    screen: 'BellNotifications',
  });

  pendingBellNavigation = false;
  pendingChatNavigation = null;
  clearRetryTimer();
  return true;
}

function scheduleBellNavigation() {
  pendingBellNavigation = true;
  pendingChatNavigation = null;

  if (attemptBellNavigation()) {
    return;
  }

  clearRetryTimer();
  let attempts = 0;
  retryTimer = setInterval(() => {
    attempts += 1;
    if (attemptBellNavigation() || attempts >= 30) {
      clearRetryTimer();
    }
  }, 100);
}

export function navigateToChatFromPush(chatId?: string, senderId?: string): void {
  if (!chatId && !senderId) {
    navigateToChatListFromPush();
    return;
  }

  scheduleChatNavigation({ chatId, senderId });
}

export function navigateToBellNotificationsFromPush(): void {
  scheduleBellNavigation();
}

export function navigateToChatListFromPush(): void {
  pendingChatNavigation = null;
  pendingBellNavigation = false;
  clearRetryTimer();

  if (!marketplaceNavigationRef.isReady()) {
    return;
  }

  marketplaceNavigationRef.navigate('Shopping', {
    screen: 'ChatList',
  });
}

export function flushPendingPushNavigation(): void {
  if (pendingBellNavigation) {
    attemptBellNavigation();
    return;
  }

  if (!pendingChatNavigation) {
    return;
  }

  attemptChatNavigation(pendingChatNavigation);
}

/** @deprecated Use flushPendingPushNavigation */
export function flushPendingChatNavigation(): void {
  flushPendingPushNavigation();
}
