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

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { ShippingAddressForm } from '../../checkout/components/ShippingAddressForm';
import type { ShippingAddress, ShippingAddressField } from '../../checkout/types/shippingAddress';

export interface CartGuestAddressModalProps {
  visible: boolean;
  value: ShippingAddress;
  errors?: Partial<Record<ShippingAddressField, string>>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onChange: (field: ShippingAddressField, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const SHEET_HEIGHT_RATIO = 0.88;
const SHEET_CHROME_HEIGHT = 156;

export function CartGuestAddressModal({
  visible,
  value,
  errors,
  isSubmitting = false,
  errorMessage,
  onChange,
  onSubmit,
  onClose,
}: CartGuestAddressModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const scrollMaxHeight = Math.max(
    220,
    sheetMaxHeight - SHEET_CHROME_HEIGHT - insets.bottom - spacing.md,
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <AppText variant="h3" style={styles.title}>
              Continue as guest
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <AppText variant="bodyMedium" style={styles.closeLabel}>
                ✕
              </AppText>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formBody}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
          >
            <ScrollView
              style={[styles.scrollArea, { maxHeight: scrollMaxHeight }]}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              bounces
            >
              <AppText variant="body" color="textSecondary">
                Enter your delivery details to continue checkout.
              </AppText>

              <ShippingAddressForm value={value} errors={errors ?? {}} onChange={onChange} />

              {errorMessage ? (
                <AppText variant="bodySmall" color="error">
                  {errorMessage}
                </AppText>
              ) : null}
            </ScrollView>

            <AppButton
              label={isSubmitting ? 'Submitting...' : 'Continue'}
              onPress={onSubmit}
              disabled={isSubmitting}
              fullWidth
              size="lg"
              shape="pill"
            />
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  closeLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formBody: {
    gap: spacing.md,
  },
  scrollArea: {
    flexGrow: 0,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
