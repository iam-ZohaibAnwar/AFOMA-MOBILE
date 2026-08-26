import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { DeliveryAddressListItem } from '../types/deliveryAddress';
import { formatDeliveryAddressLine } from '../utils/deliveryAddressDisplay';

export interface DeliveryAddressRowProps {
  address: DeliveryAddressListItem;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  variant?: 'list' | 'card';
}

export function DeliveryAddressRow({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
  variant = 'list',
}: DeliveryAddressRowProps) {
  const fullName = [address.firstName, address.lastName].filter(Boolean).join(' ').trim() || 'Address';
  const canModify = showActions && !address.isDefault;
  const isCard = variant === 'card';

  return (
    <View style={[styles.addressRow, isCard && styles.addressRowCard, isCard && selected && styles.addressRowCardSelected]}>
      <Pressable
        accessibilityRole="button"
        onPress={onSelect}
        style={({ pressed }) => [styles.addressMain, pressed && styles.pressed]}
      >
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>

        <View style={styles.addressContent}>
          {address.isDefault ? (
            <View style={styles.defaultBadge}>
              <AppText variant="caption" style={styles.defaultBadgeText}>
                Default
              </AppText>
            </View>
          ) : null}
          {!isCard && selected ? (
            <View style={styles.selectedBadge}>
              <AppText variant="caption" style={styles.selectedBadgeText}>
                Selected for delivery
              </AppText>
            </View>
          ) : null}
          <AppText variant="bodyMedium" style={styles.addressName}>
            {fullName}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={isCard ? styles.addressLine : undefined}>
            {formatDeliveryAddressLine(address)}
          </AppText>
        </View>
      </Pressable>

      {canModify ? (
        <View style={styles.rowActions}>
          {onEdit ? (
            <Pressable accessibilityRole="button" onPress={onEdit}>
              <AppText variant="bodySmall" color="textLink">
                Edit
              </AppText>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable accessibilityRole="button" onPress={onDelete}>
              <AppText variant="bodySmall" color="error">
                Delete
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addressRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  addressRowCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addressRowCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  addressMain: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressContent: {
    flex: 1,
    gap: spacing.xs,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: colors.surface,
    fontWeight: '700',
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  addressName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  addressLine: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingLeft: 34,
  },
  pressed: {
    opacity: 0.88,
  },
});
