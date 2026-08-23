import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, spacing } from '../../../design-system';

export interface CartScreenHeaderProps {
  itemCount: number;
  onBack?: () => void;
}

export function CartScreenHeader({ itemCount, onBack }: CartScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <HeaderBackButton onPress={onBack} />

      <AppText variant="h3" style={styles.title}>
        My Cart
      </AppText>

      <View style={styles.iconButton}>
        <AppText variant="bodyMedium" style={styles.bagIcon}>
          🛍
        </AppText>
        {itemCount > 0 ? (
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {itemCount > 99 ? '99+' : itemCount}
            </AppText>
          </View>
        ) : null}
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
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
});
