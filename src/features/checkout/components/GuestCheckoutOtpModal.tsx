import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { OtpInput } from '../../auth/components/AuthForm';
import { isCompleteOtp } from '../../auth/utils/otp';

export interface GuestCheckoutOtpModalProps {
  visible: boolean;
  email: string;
  isSubmitting: boolean;
  error?: string | null;
  onVerify: (otp: string) => void;
  onClose: () => void;
}

export function GuestCheckoutOtpModal({
  visible,
  email,
  isSubmitting,
  error,
  onVerify,
  onClose,
}: GuestCheckoutOtpModalProps) {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  const handleComplete = (code: string) => {
    if (!isCompleteOtp(code) || isSubmitting) {
      setOtpError(true);
      return;
    }

    setOtpError(false);
    onVerify(code);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email} to continue checkout as a guest.
          </Text>

          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setOtpError(false);
            }}
            onComplete={handleComplete}
            error={otpError || Boolean(error)}
            disabled={isSubmitting}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isSubmitting ? (
            <ActivityIndicator color="#EA580C" style={styles.loader} />
          ) : null}

          <Pressable style={styles.secondaryButton} onPress={onClose} disabled={isSubmitting}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF7ED',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172554',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});
