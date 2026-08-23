import { useEffect, useState } from 'react';
import {
  Modal,
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
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminShippingTierDraft } from '../types/adminShippingConfig';
import {
  validateAdminShippingTierDraft,
  validateAdminShippingTierNameUnique,
} from '../utils/adminShippingConfigMappers';
import { AdminShippingCountryPickerSheet } from './AdminShippingCountryPickerSheet';

export interface AdminShippingTierFormModalProps {
  visible: boolean;
  initialDraft: AdminShippingTierDraft | null;
  editingIndex: number | null;
  existingTiers: AdminShippingTierDraft[];
  onDismiss: () => void;
  onSave: (draft: AdminShippingTierDraft, editingIndex: number | null) => void;
}

const EMPTY_DRAFT: AdminShippingTierDraft = {
  tierName: '',
  countires: [],
};

export function AdminShippingTierFormModal({
  visible,
  initialDraft,
  editingIndex,
  existingTiers,
  onDismiss,
  onSave,
}: AdminShippingTierFormModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<AdminShippingTierDraft>(EMPTY_DRAFT);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraft(initialDraft ?? EMPTY_DRAFT);
    setFieldError(null);
    setCountryPickerVisible(false);
  }, [initialDraft, visible]);

  const handleSave = () => {
    const validationError =
      validateAdminShippingTierDraft(draft) ??
      validateAdminShippingTierNameUnique(draft, existingTiers, editingIndex);

    if (validationError) {
      setFieldError(validationError);
      return;
    }

    onSave(
      {
        tierName: draft.tierName.trim(),
        countires: draft.countires,
      },
      editingIndex,
    );
    onDismiss();
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
        <View style={styles.overlay}>
          <Pressable accessibilityRole="button" style={styles.backdrop} onPress={onDismiss} />
          <View
            style={[
              styles.sheet,
              {
                maxHeight: Math.round(windowHeight * 0.78),
                paddingBottom: insets.bottom + spacing.lg,
              },
            ]}
          >
            <View style={styles.handle} />
            <AppText variant="h3" style={styles.title}>
              {editingIndex != null ? 'Edit tier' : 'Add tier'}
            </AppText>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
              <AppInput
                label="Tier name"
                value={draft.tierName}
                onChangeText={(tierName) => {
                  setDraft((previous) => ({ ...previous, tierName }));
                  setFieldError(null);
                }}
                placeholder="e.g. North America"
                autoCapitalize="words"
              />

              <View style={styles.countrySection}>
                <AppText variant="label">Countries</AppText>
                <AppButton
                  label={draft.countires.length ? `${draft.countires.length} selected` : 'Select countries'}
                  variant="secondary"
                  onPress={() => setCountryPickerVisible(true)}
                  fullWidth
                />
                {draft.countires.length ? (
                  <AppText variant="caption" color="textSecondary">
                    {draft.countires.join(', ')}
                  </AppText>
                ) : null}
              </View>

              {fieldError ? (
                <AppText variant="caption" style={styles.errorText}>
                  {fieldError}
                </AppText>
              ) : null}
            </ScrollView>

            <View style={styles.actions}>
              <AppButton label="Cancel" variant="secondary" onPress={onDismiss} fullWidth />
              <AppButton label={editingIndex != null ? 'Update tier' : 'Add tier'} onPress={handleSave} fullWidth />
            </View>
          </View>
        </View>
      </Modal>

      <AdminShippingCountryPickerSheet
        visible={countryPickerVisible}
        selectedCountries={draft.countires}
        onClose={() => setCountryPickerVisible(false)}
        onChange={(countires) => {
          setDraft((previous) => ({ ...previous, countires }));
          setFieldError(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.textPrimary,
  },
  form: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  countrySection: {
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
  },
  actions: {
    gap: spacing.sm,
  },
});
