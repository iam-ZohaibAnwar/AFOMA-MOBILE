import { useEffect, useState } from 'react';
import {
  Keyboard,
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

export interface SellerAttributeRenameModalProps {
  visible: boolean;
  initialName: string;
  isSaving: boolean;
  error?: string | null;
  onDismiss: () => void;
  onSave: (nextName: string) => void;
  onClearError: () => void;
}

export function SellerAttributeRenameModal({
  visible,
  initialName,
  isSaving,
  error,
  onDismiss,
  onSave,
  onClearError,
}: SellerAttributeRenameModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [initialName, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityLabel="Close rename attribute" />

        <View
          style={[
            styles.sheet,
            {
              marginBottom: keyboardHeight,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <AppText variant="bodyMedium" style={styles.title}>
            Rename attribute
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
            Updates this option for your customizable product variations.
          </AppText>

          <AppInput
            value={name}
            tone="surface"
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
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
