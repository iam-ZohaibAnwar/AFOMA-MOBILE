import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';

export interface ProductDetailPolicyContentProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

export function ProductDetailPolicyContent({ policy, theme }: ProductDetailPolicyContentProps) {
  const cancellationMessage = getCancellationPolicyMessage(policy);
  const returnMessage = getReturnPolicyMessage(policy);

  if (!cancellationMessage && !returnMessage) {
    return (
      <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
        No cancellation policies available for this shop.
      </AppText>
    );
  }

  return (
    <View style={styles.container}>
      {cancellationMessage ? (
        <View style={styles.policyBlock}>
          <AppText variant="bodyMedium" style={[styles.policyTitle, { color: theme.textPrimary }]}>
            Cancellation Policy
          </AppText>
          <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
            {cancellationMessage}
          </AppText>
        </View>
      ) : null}

      {returnMessage ? (
        <View style={styles.policyBlock}>
          <AppText variant="bodyMedium" style={[styles.policyTitle, { color: theme.textPrimary }]}>
            Return Policy
          </AppText>
          <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
            {returnMessage}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  policyBlock: {
    gap: spacing.xs,
  },
  policyTitle: {
    fontWeight: '700',
  },
});
