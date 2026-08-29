import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ChatSummary } from '../types/chat';
import { getChatTitle, getLastMessagePreview } from '../utils/chatDisplay';

export interface ChatListItemProps {
  chat: ChatSummary;
  myId: string;
  myRole?: string;
  onPress: () => void;
}

function formatTimestamp(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ChatListItem({ chat, myId, myRole, onPress }: ChatListItemProps) {
  const title = getChatTitle(chat, myId, myRole);
  const preview = getLastMessagePreview(chat.lastMessage);
  const unread = chat.unreadCount ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <AppText variant="bodyMedium" style={styles.avatarLabel}>
          {title.charAt(0).toUpperCase()}
        </AppText>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText variant="bodyMedium" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" style={styles.timestamp}>
            {formatTimestamp(chat.lastMessage?.createdAt ?? chat.updatedAt)}
          </AppText>
        </View>

        <View style={styles.previewRow}>
          <AppText variant="caption" style={styles.preview} numberOfLines={1}>
            {preview}
          </AppText>
          {unread > 0 ? (
            <View style={styles.badge}>
              <AppText variant="caption" style={styles.badgeText}>
                {unread > 9 ? '9+' : unread}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.88,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timestamp: {
    color: colors.textMuted,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  preview: {
    flex: 1,
    color: colors.textMuted,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
