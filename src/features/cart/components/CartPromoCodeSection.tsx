import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
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
          <View style={styles.iconBadge}>
            <AppText variant="caption" style={styles.iconBadgeText}>
              %
            </AppText>
          </View>
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
            <AppText variant="bodyMedium" color="textMuted">
              ›
            </AppText>
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
    backgroundColor: colors.surfaceGrey,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
  },
  applyButton: {
    width: 32,
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
