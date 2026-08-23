import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export type PaymentMethodId = 'paypal' | 'stripe' | 'korapay' | 'applepay';

export interface PaymentMethodOptionProps {
  id: PaymentMethodId;
  label: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

export function PaymentMethodOption({
  id,
  label,
  description,
  selected,
  disabled = false,
  onSelect,
}: PaymentMethodOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onSelect(id)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>

      <View style={styles.content}>
        <AppText variant="bodyMedium" style={styles.label}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
