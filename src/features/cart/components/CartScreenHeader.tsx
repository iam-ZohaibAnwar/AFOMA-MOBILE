import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, spacing } from '../../../design-system';

export interface CartScreenHeaderProps {
  onBack?: () => void;
  itemCount?: number;
}

export function CartScreenHeader({ onBack, itemCount }: CartScreenHeaderProps) {
  const subtitle =
    typeof itemCount === 'number'
      ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
      : null;

  return (
    <View style={styles.header}>
      <HeaderBackButton onPress={onBack} />

      <View style={styles.titleBlock}>
        <AppText variant="h3" style={styles.title}>
          Cart
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>

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
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sideSpacer: {
    width: 44,
    height: 44,
  },
});
