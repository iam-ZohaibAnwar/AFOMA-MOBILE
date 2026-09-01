import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { colors, layout, radius, spacing } from '../../../design-system';
import { COUPON_CODE_MAX_LEN } from '../../../utils/couponCodeRules';

export interface CartPromoCodeSectionProps {
  onApply: (code: string) => Promise<void>;
  onRemove?: () => void | Promise<void>;
  isApplying?: boolean;
  appliedCode?: string;
  error?: string | null;
  message?: string | null;
}

export function CartPromoCodeSection({
  onApply,
  onRemove,
  isApplying = false,
  appliedCode,
  error,
  message,
}: CartPromoCodeSectionProps) {
  const [promoCode, setPromoCode] = useState(appliedCode ?? '');

  useEffect(() => {
    setPromoCode(appliedCode ?? '');
  }, [appliedCode]);

  const handleApply = () => {
    void onApply(promoCode);
  };

  const handleRemove = () => {
    if (onRemove) {
      void onRemove();
    }
  };

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.inputRow}
        onPress={() => {
          if (!appliedCode && !isApplying) {
            handleApply();
          }
        }}
        disabled={isApplying || Boolean(appliedCode) || !promoCode.trim()}
      >
        <View style={styles.inputWrap}>
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter your promo code"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isApplying && !appliedCode}
            maxLength={COUPON_CODE_MAX_LEN}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleApply}
          />
        </View>
        <View style={styles.applyButton}>
          {isApplying ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ChevronForwardIcon color={colors.primary} size={24} />
          )}
        </View>
      </Pressable>

      {appliedCode ? (
        <View style={styles.appliedRow}>
          <AppText variant="bodySmall" color="success" style={styles.appliedText}>
            Promo code applied: {appliedCode}
          </AppText>
          {onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove promo code"
              onPress={handleRemove}
              disabled={isApplying}
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            >
              <AppText variant="bodySmall" color="textLink">
                Remove
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {!appliedCode && message ? (
        <AppText variant="bodySmall" color="success">
          {message}
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="bodySmall" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWhite,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
  applyButton: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  appliedText: {
    flex: 1,
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
