import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface SellerReviewReplyComposerProps {
  visible: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (replyText: string) => void;
}

export function SellerReviewReplyComposer({
  visible,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: SellerReviewReplyComposerProps) {
  const insets = useSafeAreaInsets();
  const [replyText, setReplyText] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setReplyText('');
      setFieldError(null);
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmed = replyText.trim();
    if (!trimmed) {
      setFieldError('Reply cannot be empty.');
      return;
    }

    setFieldError(null);
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="h3">Write a reply</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <AppText variant="bodyMedium" color="textLink">
              Close
            </AppText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="body" color="textSecondary">
            Your reply will be submitted for moderation before it appears publicly.
          </AppText>

          <AppInput
            label="Your reply"
            value={replyText}
            onChangeText={(text) => {
              setReplyText(text);
              if (fieldError) {
                setFieldError(null);
              }
            }}
            placeholder="Thanks for your feedback..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.textArea}
            editable={!isSubmitting}
            error={fieldError ?? undefined}
          />

          {errorMessage ? (
            <AppText variant="bodySmall" color="error">
              {errorMessage}
            </AppText>
          ) : null}

          <AppButton
            label={isSubmitting ? 'Submitting...' : 'Submit reply'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            fullWidth
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  textArea: {
    minHeight: 140,
  },
});
