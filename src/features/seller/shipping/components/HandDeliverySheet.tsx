import { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { HandDeliveryOptionsForm } from '../types/sellerShipping';

export interface HandDeliverySheetProps {
  visible: boolean;
  currency: string;
  value: HandDeliveryOptionsForm;
  onClose: () => void;
  onSave: (value: HandDeliveryOptionsForm, enabled: boolean) => void;
}

export function HandDeliverySheet({
  visible,
  currency,
  value,
  onClose,
  onSave,
}: HandDeliverySheetProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setError(null);
    }
  }, [value, visible]);

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

  const handleSave = () => {
    if (draft.free_delivery) {
      onSave(draft, true);
      onClose();
      return;
    }

    if (!draft.fee_rate.trim()) {
      setError('Enter a delivery fee or enable free delivery.');
      return;
    }

    onSave(draft, true);
    onClose();
  };

  const handleDisable = () => {
    onSave({ free_delivery: false, fee_rate: '' }, false);
    onClose();
  };

  const currencyCode = currency.toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close hand delivery" />

        <View
          style={[
            styles.sheet,
            shadows.modal,
            {
              marginBottom: keyboardHeight,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Hand delivery
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.copy}>
            Configure local hand delivery for buyers in your area.
          </AppText>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <AppText variant="bodyMedium" style={styles.optionTitle}>
                  Free delivery
                </AppText>
                <Switch
                  value={draft.free_delivery}
                  onValueChange={(enabled) =>
                    setDraft((current) => ({
                      ...current,
                      free_delivery: enabled,
                      fee_rate: enabled ? '' : current.fee_rate,
                    }))
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            </View>

            {!draft.free_delivery ? (
              <AppInput
                tone="surface"
                label={`Delivery fee (${currencyCode})`}
                value={draft.fee_rate}
                onChangeText={(text) => setDraft((current) => ({ ...current, fee_rate: text }))}
                keyboardType="decimal-pad"
              />
            ) : null}

            {error ? (
              <AppText variant="caption" color="error">
                {error}
              </AppText>
            ) : null}

            <View style={styles.actions}>
              <AppButton label="Save hand delivery" onPress={handleSave} />
              <AppButton label="Disable hand delivery" variant="secondary" onPress={handleDisable} />
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  copy: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  optionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.large,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
