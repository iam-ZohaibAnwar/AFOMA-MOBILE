import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminProductListItem } from '../types/adminProductManagement';
import {
  approvalBadgeVariant,
  formatAdminProductApprovalStatus,
  formatAdminProductInventoryStatus,
  formatAdminProductListPrice,
  getAdminProductCategoryLabel,
  getAdminProductSellerName,
  getAdminProductSellerUuid,
  inventoryBadgeVariant,
} from '../utils/adminProductDisplay';

export interface AdminProductCardProps {
  product: AdminProductListItem;
  onPress: (product: AdminProductListItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: (product: AdminProductListItem) => void;
  selectionDisabled?: boolean;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodySmall" style={styles.metaValue}>
        {value}
      </AppText>
    </View>
  );
}

function Checkbox({
  selected,
  disabled,
  onPress,
}: {
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.checkbox,
        selected && styles.checkboxSelected,
        disabled && styles.checkboxDisabled,
        pressed && !disabled && styles.checkboxPressed,
      ]}
    >
      {selected ? <AppText variant="caption" style={styles.checkmark}>✓</AppText> : null}
    </Pressable>
  );
}

export function AdminProductCard({
  product,
  onPress,
  selectable = false,
  selected = false,
  onSelectToggle,
  selectionDisabled = false,
}: AdminProductCardProps) {
  const productId = product._id;
  const approvalLabel = formatAdminProductApprovalStatus(product.productStatus);
  const inventoryLabel = formatAdminProductInventoryStatus(product.status);

  const cardBody = (
    <Pressable
      accessibilityRole="button"
      disabled={!productId}
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.cardBody, pressed && styles.cardPressed]}
    >
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.productName} numberOfLines={2}>
          {product.productName?.trim() || 'Untitled product'}
        </AppText>
      </View>

      <View style={styles.badgeRow}>
        <AppBadge
          label={approvalLabel}
          variant={approvalBadgeVariant(product.productStatus)}
        />
        <AppBadge label={inventoryLabel} variant={inventoryBadgeVariant(product.status)} />
      </View>

      <View style={styles.metaBlock}>
        <MetaRow label="Price" value={formatAdminProductListPrice(product)} />
        <MetaRow label="Type" value={product.productType?.trim() || '—'} />
        <MetaRow label="Category" value={getAdminProductCategoryLabel(product)} />
        <MetaRow label="Seller" value={getAdminProductSellerName(product)} />
        <MetaRow label="Seller ID" value={getAdminProductSellerUuid(product)} />
      </View>
    </Pressable>
  );

  if (!selectable) {
    return <View style={styles.card}>{cardBody}</View>;
  }

  return (
    <View style={styles.card}>
      <View style={styles.selectableRow}>
        <Checkbox
          selected={selected}
          disabled={selectionDisabled || !productId}
          onPress={() => onSelectToggle?.(product)}
        />
        <View style={styles.cardContent}>{cardBody}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  selectableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  cardContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  cardBody: {
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productName: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaBlock: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.small,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkboxPressed: {
    opacity: 0.85,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
