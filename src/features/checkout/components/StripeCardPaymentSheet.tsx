import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface StripeCardPaymentSheetProps {
  visible: boolean;
  billingEmail?: string;
  billingName?: string;
  onPay: (billing: { name: string; email: string }) => Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function StripeCardPaymentSheet({
  visible,
  billingEmail = '',
  billingName = '',
  onPay,
  onCancel,
  isProcessing = false,
}: StripeCardPaymentSheetProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(billingName);
  const [email, setEmail] = useState(billingEmail);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!cardComplete) {
      setError('Enter your card details to continue.');
      return;
    }

    if (!name.trim()) {
      setError('Enter the name on your card.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your billing email.');
      return;
    }

    setError(null);
    await onPay({ name: name.trim(), email: email.trim() });
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.header}>
          <AppText variant="h3" style={styles.title}>
            Debit / Credit Card
          </AppText>
          <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8} disabled={isProcessing}>
            <AppText variant="bodyMedium" style={styles.close}>
              Close
            </AppText>
          </Pressable>
        </View>

        <View style={styles.content}>
          <AppText variant="bodySmall" color="textSecondary">
            Pay securely with Visa, Mastercard, and more.
          </AppText>

          <AppInput
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!isProcessing}
          />

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isProcessing}
          />

          <View style={styles.cardFieldWrap}>
            <AppText variant="caption" color="textSecondary" style={styles.cardLabel}>
              Card details
            </AppText>
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: colors.background,
                textColor: colors.textPrimary,
                placeholderColor: colors.textMuted,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.medium,
              }}
              style={styles.cardField}
              onCardChange={(details) => {
                setCardComplete(Boolean(details.complete));
              }}
            />
          </View>

          {error ? (
            <AppText variant="bodySmall" color="error">
              {error}
            </AppText>
          ) : null}

          <AppButton
            label={isProcessing ? 'Processing...' : 'Pay Securely'}
            fullWidth
            size="lg"
            shape="pill"
            loading={isProcessing}
            disabled={isProcessing}
            onPress={() => void handlePay()}
          />

          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="caption" color="textSecondary">
                Confirming payment...
              </AppText>
            </View>
          ) : null}
        </View>
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
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  close: {
    color: colors.textLink,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  cardFieldWrap: {
    gap: spacing.xs,
  },
  cardLabel: {
    fontWeight: '600',
  },
  cardField: {
    width: '100%',
    height: 52,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
