import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface ChatComposerProps {
  onSend: (text: string) => Promise<boolean>;
  disabled?: boolean;
  isSending?: boolean;
}

export function ChatComposer({ onSend, disabled = false, isSending = false }: ChatComposerProps) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isSending) {
      return;
    }

    const sent = await onSend(trimmed);
    if (sent) {
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write a message…"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        multiline
        editable={!disabled && !isSending}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={() => {
          void handleSend();
        }}
        disabled={disabled || isSending || !text.trim()}
        style={({ pressed }) => [
          styles.sendButton,
          (disabled || isSending || !text.trim()) && styles.sendButtonDisabled,
          pressed && styles.pressed,
        ]}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <AppText variant="bodyMedium" style={styles.sendLabel}>
            Send
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    borderRadius: radius.large,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sendButton: {
    minWidth: 72,
    height: 44,
    borderRadius: radius.large,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
