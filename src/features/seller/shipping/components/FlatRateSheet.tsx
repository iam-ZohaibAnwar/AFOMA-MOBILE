import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { FlatRateOptionsForm } from '../types/sellerShipping';

export interface FlatRateSheetProps {
  visible: boolean;
  currency: string;
  value: FlatRateOptionsForm;
  onClose: () => void;
  onSave: (value: FlatRateOptionsForm, enabled: boolean) => void;
}

const SHEET_HEIGHT_RATIO = 0.88;

export function FlatRateSheet({
  visible,
  currency,
  value,
  onClose,
  onSave,
}: FlatRateSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setError(null);
    }
  }, [value, visible]);

  const setMode = (mode: 'free' | 'fixed' | 'weighted') => {
    setDraft((current) => ({
      ...current,
      free_shipping: mode === 'free',
      is_flat_rate: mode === 'fixed',
      is_flat_weighted: mode === 'weighted',
    }));
    setError(null);
  };

  const handleSave = () => {
    if (draft.free_shipping) {
      onSave(draft, true);
      onClose();
      return;
    }

    if (draft.is_flat_rate) {
      if (!draft.flat_rate_rate.trim() || !draft.additional_cost.trim()) {
        setError('Enter both the fixed rate and additional item cost.');
        return;
      }

      onSave(draft, true);
      onClose();
      return;
    }

    if (draft.is_flat_weighted) {
      if (!draft.flat_rate_0_1.trim() || !draft.flat_rate_1_5.trim() || !draft.flat_rate_5_A.trim()) {
        setError('Enter all three weighted rate bands.');
        return;
      }

      onSave(draft, true);
      onClose();
      return;
    }

    setError('Choose free shipping, fixed rate, or weighted rates.');
  };

  const handleDisable = () => {
    onSave(
      {
        free_shipping: false,
        is_flat_rate: false,
        flat_rate_rate: '',
        additional_cost: '',
        is_flat_weighted: false,
        flat_rate_0_1: '',
        flat_rate_1_5: '',
        flat_rate_5_A: '',
      },
      false,
    );
    onClose();
  };

  const currencyCode = currency.toUpperCase();
  const activeMode = draft.free_shipping
    ? 'free'
    : draft.is_flat_rate
      ? 'fixed'
      : draft.is_flat_weighted
        ? 'weighted'
        : null;

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
            Flat rate
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.copy}>
            Rates are entered in {currencyCode} and converted to CAD when saved.
          </AppText>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <OptionCard
              title="Free shipping"
              selected={activeMode === 'free'}
              onPress={() => setMode('free')}
            >
              <AppText variant="caption" color="textSecondary">
                Buyers see free flat-rate shipping.
              </AppText>
            </OptionCard>

            <OptionCard
              title="Fixed rate"
              selected={activeMode === 'fixed'}
              onPress={() => setMode('fixed')}
            >
              <AppInput
                tone="surface"
                label={`Fixed rate (${currencyCode})`}
                value={draft.flat_rate_rate}
                onChangeText={(text) => setDraft((current) => ({ ...current, flat_rate_rate: text }))}
                keyboardType="decimal-pad"
                editable={activeMode === 'fixed'}
              />
              <AppInput
                tone="surface"
                label={`Additional item cost (${currencyCode})`}
                value={draft.additional_cost}
                onChangeText={(text) => setDraft((current) => ({ ...current, additional_cost: text }))}
                keyboardType="decimal-pad"
                editable={activeMode === 'fixed'}
              />
            </OptionCard>

            <OptionCard
              title="Weighted rates"
              selected={activeMode === 'weighted'}
              onPress={() => setMode('weighted')}
            >
              <AppInput
                tone="surface"
                label={`0–1 kg (${currencyCode})`}
                value={draft.flat_rate_0_1}
                onChangeText={(text) => setDraft((current) => ({ ...current, flat_rate_0_1: text }))}
                keyboardType="decimal-pad"
                editable={activeMode === 'weighted'}
              />
              <AppInput
                tone="surface"
                label={`1–5 kg (${currencyCode})`}
                value={draft.flat_rate_1_5}
                onChangeText={(text) => setDraft((current) => ({ ...current, flat_rate_1_5: text }))}
                keyboardType="decimal-pad"
                editable={activeMode === 'weighted'}
              />
              <AppInput
                tone="surface"
                label={`5+ kg (${currencyCode})`}
                value={draft.flat_rate_5_A}
                onChangeText={(text) => setDraft((current) => ({ ...current, flat_rate_5_A: text }))}
                keyboardType="decimal-pad"
                editable={activeMode === 'weighted'}
              />
            </OptionCard>

            {error ? (
              <AppText variant="caption" color="error">
                {error}
              </AppText>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Save flat rate" onPress={handleSave} />
            <AppButton label="Disable flat rate" variant="secondary" onPress={handleDisable} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function OptionCard({
  title,
  selected,
  onPress,
  children,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}
    >
      <View style={styles.optionHeader}>
        <AppText variant="bodyMedium" style={styles.optionTitle}>
          {title}
        </AppText>
        <Switch
          value={selected}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>
      {selected ? children : null}
    </Pressable>
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
    marginBottom: spacing.xs,
  },
  copy: {
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  optionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.large,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  optionCardSelected: {
    borderColor: colors.primary,
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
    marginTop: spacing.md,
  },
});
