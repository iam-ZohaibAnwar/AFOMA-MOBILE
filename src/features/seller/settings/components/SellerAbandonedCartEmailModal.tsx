import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="h3">Abandoned-cart email</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <AppText variant="bodyMedium" color="textLink">
              Close
            </AppText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="body" color="textSecondary">
            Send a recovery email to a customer who left items in their cart. Use the coupon code
            you want to offer and the event ID from the notification email.
          </AppText>

          <AppInput
            label="Coupon code"
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

          <View style={styles.actions}>
            <AppButton label="Cancel" variant="outline" onPress={onClose} disabled={isSending} />
            <AppButton
              label="Send email"
              onPress={handleSubmit}
              loading={isSending}
              disabled={isSending}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
