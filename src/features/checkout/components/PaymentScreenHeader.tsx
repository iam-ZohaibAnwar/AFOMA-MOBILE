import { StyleSheet, View } from 'react-native';

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
        Payment
      </AppText>
      <View style={styles.spacer} />
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
  spacer: {
    width: 40,
  },
});
