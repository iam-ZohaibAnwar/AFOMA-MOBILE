import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { SellerPickupFormValues } from '../types/sellerOrderShipping';

export interface SellerPickupSheetProps {
  visible: boolean;
  values: SellerPickupFormValues;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onChange: (values: SellerPickupFormValues) => void;
  onSubmit: () => void;
}

const SHEET_HEIGHT_RATIO = 0.9;

export function SellerPickupSheet({
  visible,
  values,
  isSubmitting,
  error,
  onClose,
  onChange,
  onSubmit,
}: SellerPickupSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    if (visible) {
      setDraft(values);
    }
  }, [values, visible]);

  const updateField = <K extends keyof SellerPickupFormValues>(key: K, value: SellerPickupFormValues[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    onChange(next);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <View
          style={[
            styles.sheet,
            shadows.modal,
            { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Schedule pickup
          </AppText>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppInput
              label="Pickup date"
              value={draft.pickupDate}
              onChangeText={(text) => updateField('pickupDate', text)}
              placeholder="YYYY-MM-DD"
            />
            <AppInput
              label="Ready from"
              value={draft.readyFrom}
              onChangeText={(text) => updateField('readyFrom', text)}
              placeholder="HH:MM"
            />
            <AppInput
              label="Ready until"
              value={draft.readyUntil}
              onChangeText={(text) => updateField('readyUntil', text)}
              placeholder="HH:MM"
            />
            <AppInput
              label="Pickup location"
              value={draft.pickupLocation}
              onChangeText={(text) => updateField('pickupLocation', text)}
            />
            <AppInput
              label="Contact name"
              value={draft.contactName}
              onChangeText={(text) => updateField('contactName', text)}
            />
            <AppInput
              label="Phone"
              value={draft.contactPhone}
              onChangeText={(text) => updateField('contactPhone', text)}
              keyboardType="phone-pad"
            />

            {error ? (
              <AppText variant="caption" color="error">
                {error}
              </AppText>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton
              label={isSubmitting ? 'Scheduling...' : 'Schedule pickup'}
              loading={isSubmitting}
              onPress={onSubmit}
            />
            <AppButton label="Cancel" variant="secondary" disabled={isSubmitting} onPress={onClose} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
