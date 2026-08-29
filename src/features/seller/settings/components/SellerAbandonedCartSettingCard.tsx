import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors } from '../../../../design-system';
import { SellerSettingsOptionCard } from './SellerSettingsOptionCard';

export interface SellerAbandonedCartSettingCardProps {
  onPress: () => void;
}

export function SellerAbandonedCartSettingCard({ onPress }: SellerAbandonedCartSettingCardProps) {
  return (
    <SellerSettingsOptionCard
      title="Abandoned-cart email"
      description="Send a recovery email to a customer who left items in their cart."
      icon="mail-outline"
      accentColor={colors.secondary}
      footer={
        <AppText variant="caption" color="textMuted">
          Use the coupon code you want to offer and the event ID from the notification email.
        </AppText>
      }
      trailing={
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <AppText variant="bodySmall" color="textLink" style={styles.actionLabel}>
            Send
          </AppText>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  actionLabel: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
