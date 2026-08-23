import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface AdminGlobalAttributeRenameModalProps {
  visible: boolean;
  initialName: string;
  isSaving: boolean;
  error?: string | null;
  onDismiss: () => void;
  onSave: (nextName: string) => void;
  onClearError: () => void;
}

export function AdminGlobalAttributeRenameModal({
  visible,
  initialName,
  isSaving,
  error,
  onDismiss,
  onSave,
  onClearError,
}: AdminGlobalAttributeRenameModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [initialName, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <AppText variant="bodyMedium" style={styles.title}>
              Rename attribute
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
              Updates the platform-wide variation name.
            </AppText>

            <AppInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                onClearError();
              }}
              placeholder="Attribute name"
              editable={!isSaving}
              error={error ?? undefined}
              autoFocus
            />

            <View style={styles.actions}>
              <AppButton label="Cancel" variant="ghost" onPress={onDismiss} disabled={isSaving} />
              <AppButton
                label="Save"
                onPress={() => onSave(name)}
                loading={isSaving}
                disabled={isSaving}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  keyboardWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
