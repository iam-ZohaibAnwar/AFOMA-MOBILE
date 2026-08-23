import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, radius } from '../../design-system';

export interface CartBadgeProps {
  count: number;
  maxCount?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CartBadge({ count, maxCount = 99, children, style }: CartBadgeProps) {
  const visibleCount = count > 0;
  const label = count > maxCount ? `${maxCount}+` : String(count);

  return (
    <View style={[styles.wrap, style]}>
      {children}
      {visibleCount ? (
        <View style={styles.badge} accessibilityLabel={`${count} items in cart`}>
          <AppText variant="caption" color="textInverse" style={styles.badgeText}>
            {label}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
});
