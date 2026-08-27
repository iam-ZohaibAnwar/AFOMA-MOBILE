import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ChatMessage } from '../types/chat';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function ChatMessageBubble({ message, isOwn }: ChatMessageBubbleProps) {
  const label = message.text?.trim() || (message.attachments?.length ? '[Attachment]' : '');

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther, message.failed && styles.failed]}>
        <AppText variant="body" style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {label}
        </AppText>
        <AppText variant="caption" style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {message.optimistic ? 'Sending…' : formatTime(message.createdAt)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowOwn: {
    alignItems: 'flex-end',
  },
  rowOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.large,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.small,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: radius.small,
  },
  failed: {
    opacity: 0.6,
  },
  text: {
    lineHeight: 20,
  },
  textOwn: {
    color: colors.background,
  },
  textOther: {
    color: colors.textPrimary,
  },
  time: {
    alignSelf: 'flex-end',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.78)',
  },
  timeOther: {
    color: colors.textMuted,
  },
});
