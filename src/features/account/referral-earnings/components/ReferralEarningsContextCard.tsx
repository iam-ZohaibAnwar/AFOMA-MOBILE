import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface ReferralEarningsContextCardProps {
  isSeller: boolean;
}

export function ReferralEarningsContextCard({ isSeller }: ReferralEarningsContextCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.title}>
          {isSeller ? 'Your referral commissions' : 'Referral earnings'}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.body}>
          {isSeller
            ? 'Commissions from buyers and sellers you referred to AFOMA. Payouts for your own shop sales are under Seller → Earnings.'
            : 'Commissions from eligible orders placed by customers you referred to AFOMA.'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  iconWrap: {
    marginTop: 2,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  body: {
    lineHeight: 20,
  },
});
