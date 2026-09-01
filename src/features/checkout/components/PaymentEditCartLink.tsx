import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

interface PaymentEditCartLinkProps {
  onPress: () => void;
}

export function PaymentEditCartLink({ onPress }: PaymentEditCartLinkProps) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color="textSecondary">
        Delivery and order details are on your cart.
      </AppText>
      <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
        <AppText variant="bodySmall" color="textLink" style={styles.link}>
          Edit cart
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  link: {
    fontWeight: '700',
  },
});
