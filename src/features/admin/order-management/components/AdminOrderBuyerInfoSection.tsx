import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderDetailCollapsibleSection } from '../../../orders/components/OrderDetailCollapsibleSection';
import {
  formatCustomerEmail,
  formatCustomerName,
  formatShippingAddressLines,
} from '../../../orders/utils/orderDisplay';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import { getAdminCustomerPhone } from '../utils/adminOrderDetailDisplay';

interface AdminOrderBuyerInfoSectionProps {
  order: AdminOrderDetail;
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

export function AdminOrderBuyerInfoSection({
  order,
  onContactBuyer,
}: AdminOrderBuyerInfoSectionProps) {
  const customerName =
    formatCustomerName(order.userInfo) ??
    (order.userInfo as { name?: string } | undefined)?.name?.trim() ??
    '—';
  const customerEmail = formatCustomerEmail(order.userInfo) ?? order.userInfo?.email ?? '—';
  const shippingLines = formatShippingAddressLines(order.userInfo);
  const phone = getAdminCustomerPhone(order);

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
      <View style={styles.profileCopy}>
        <AppText variant="bodyMedium" style={styles.name}>
          {customerName}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
          {customerEmail}
        </AppText>
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
          <AppText variant="bodySmall" style={styles.bodyText}>
            {phone}
          </AppText>
        </FieldBlock>
      ) : null}

      {onContactBuyer ? (
        <AppButton label="Contact Buyer" variant="outline" onPress={onContactBuyer} fullWidth />
      ) : null}
    </OrderDetailCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  profileCopy: {
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
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
});
