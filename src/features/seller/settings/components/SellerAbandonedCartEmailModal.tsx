import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface SellerAbandonedCartEmailModalProps {
  visible: boolean;
  isSending?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (eventId: string, couponCode: string) => void;
}

export function SellerAbandonedCartEmailModal({
  visible,
  isSending = false,
  errorMessage,
  onClose,
  onSubmit,
}: SellerAbandonedCartEmailModalProps) {
  const insets = useSafeAreaInsets();
  const [couponCode, setCouponCode] = useState('');
  const [eventId, setEventId] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [eventIdError, setEventIdError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCouponCode('');
      setEventId('');
      setCouponError(null);
      setEventIdError(null);
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmedCoupon = couponCode.trim();
    const trimmedEventId = eventId.trim();
    let hasError = false;

    if (!trimmedCoupon) {
      setCouponError('Coupon code is required.');
      hasError = true;
    }

    if (!trimmedEventId) {
      setEventIdError('Event ID is required.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    onSubmit(trimmedEventId, trimmedCoupon);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardWrap}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <AppText variant="bodyMedium" style={styles.title}>
            Abandoned-cart email
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
            Send a recovery email with a coupon to win back the customer.
          </AppText>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
          >
            <AppInput
              label="Coupon code"
              tone="surface"
              value={couponCode}
              onChangeText={(text) => {
                setCouponCode(text);
                if (couponError) {
                  setCouponError(null);
                }
              }}
              placeholder="Write your coupon code"
              autoCapitalize="characters"
              editable={!isSending}
              error={couponError ?? undefined}
            />

            <AppInput
              label="Event ID"
              tone="surface"
              value={eventId}
              onChangeText={(text) => {
                setEventId(text);
                if (eventIdError) {
                  setEventIdError(null);
                }
              }}
              placeholder="Write ID you received in email"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSending}
              error={eventIdError ?? undefined}
            />

            {errorMessage ? (
              <AppText variant="bodySmall" color="error">
                {errorMessage}
              </AppText>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Cancel" variant="ghost" onPress={onClose} disabled={isSending} />
            <AppButton
              label="Send email"
              onPress={handleSubmit}
              loading={isSending}
              disabled={isSending}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    maxHeight: '88%',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
