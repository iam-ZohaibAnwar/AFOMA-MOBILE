import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, spacing } from '../../../design-system';

export interface PaymentScreenHeaderProps {
  onBack?: () => void;
}

export function PaymentScreenHeader({ onBack }: PaymentScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <HeaderBackButton onPress={onBack} />

      <AppText variant="h3" style={styles.title}>
        Checkout
      </AppText>

      <View style={styles.secureWrap}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted" style={styles.secureText}>
          Secure
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  secureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  secureText: {
    flexShrink: 1,
  },
});
