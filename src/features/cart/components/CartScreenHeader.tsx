import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, spacing } from '../../../design-system';

export interface CartScreenHeaderProps {
  onBack?: () => void;
}

export function CartScreenHeader({ onBack }: CartScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <HeaderBackButton onPress={onBack} />

      <AppText variant="h3" style={styles.title}>
        My Cart
      </AppText>

      <View style={styles.sideSpacer} />
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
  sideSpacer: {
    width: 40,
    height: 40,
  },
});
