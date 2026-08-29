import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import {
  formatCustomerEmail,
  formatCustomerName,
  formatShippingAddressLines,
} from '../../../orders/utils/orderDisplay';
import type { SellerOrderDetail } from '../types/sellerOrder';
import {
  getSellerCustomerInitials,
  getSellerCustomerPhone,
} from '../utils/sellerOrderDetailDisplay';

interface SellerOrderBuyerInfoSectionProps {
  order: SellerOrderDetail;
  onContactBuyer?: () => void;
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <AppText variant="caption" color="textMuted" style={styles.fieldLabel}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

export function SellerOrderBuyerInfoSection({
  order,
  onContactBuyer,
}: SellerOrderBuyerInfoSectionProps) {
  const customerName =
    formatCustomerName(order.userInfo) ??
    (order.userInfo as { name?: string } | undefined)?.name?.trim() ??
    '—';
  const customerEmail = formatCustomerEmail(order.userInfo) ?? order.userInfo?.email ?? '—';
  const shippingLines = formatShippingAddressLines(order.userInfo);
  const phone = getSellerCustomerPhone(order);
  const initials = getSellerCustomerInitials(customerName === '—' ? undefined : customerName);

  return (
    <OrderDetailCollapsibleSection
      title="Buyer Information"
      icon="person-outline"
      collapsedPreview={
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {customerName}
        </AppText>
      }
    >
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <AppText variant="bodyMedium" style={styles.avatarText}>
            {initials}
          </AppText>
        </View>
        <View style={styles.profileCopy}>
          <AppText variant="bodyMedium" style={styles.name}>
            {customerName}
          </AppText>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {customerEmail}
            </AppText>
          </View>
        </View>
      </View>

      <FieldBlock label="SHIPPING ADDRESS">
        {shippingLines.length ? (
          shippingLines.map((line, index) => (
            <AppText key={`${line}-${index}`} variant="bodySmall" style={styles.bodyText}>
              {line}
            </AppText>
          ))
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            —
          </AppText>
        )}
      </FieldBlock>

      {phone ? (
        <FieldBlock label="CONTACT PHONE">
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
            <AppText variant="bodySmall" style={styles.bodyText}>
              {phone}
            </AppText>
          </View>
        </FieldBlock>
      ) : null}

      {onContactBuyer ? (
        <AppButton label="Contact Buyer" variant="outline" onPress={onContactBuyer} fullWidth />
      ) : null}
    </OrderDetailCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldBlock: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  bodyText: {
    color: colors.textPrimary,
    lineHeight: 22,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
