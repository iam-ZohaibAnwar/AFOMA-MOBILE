import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductStorePolicy } from '../../../services/types/product';
import {
  getCancellationPolicyMessage,
  getReturnPolicyMessage,
} from '../utils/productDisplay';

export interface ProductSellerPolicySectionProps {
  policy: ProductStorePolicy;
  theme: PdpTheme;
}

export function ProductSellerPolicySection({ policy, theme }: ProductSellerPolicySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const cancellationMessage = getCancellationPolicyMessage(policy);
  const returnMessage = getReturnPolicyMessage(policy);

  if (!cancellationMessage && !returnMessage) {
    return null;
  }

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel="Cancel and return policies"
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <AppText variant="label" style={{ color: theme.textPrimary }}>
          Cancel & Return Policies
        </AppText>
        <AppText variant="bodyMedium" style={{ color: theme.textPrimary }}>
          {expanded ? '▾' : '▸'}
        </AppText>
      </Pressable>

      {expanded ? (
        <View style={[styles.content, { borderBottomColor: theme.border }]}>
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  policyBlock: {
    gap: spacing.xs,
  },
  policyTitle: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
