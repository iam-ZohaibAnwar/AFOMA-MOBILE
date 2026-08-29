import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { AdminShippingTierDraft } from '../types/adminShippingConfig';
import { formatAdminShippingTierCountries } from '../utils/adminShippingConfigMappers';

export interface AdminShippingTierCardProps {
  tier: AdminShippingTierDraft;
  onEdit: () => void;
  onMatrix: () => void;
  onDelete: () => void;
}

export function AdminShippingTierCard({ tier, onEdit, onMatrix, onDelete }: AdminShippingTierCardProps) {
  const confirmDelete = () => {
    Alert.alert(
      'Delete tier',
      `Remove "${tier.tierName}" from the shipping matrix?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.accent} />

      <View style={styles.body}>
        <AppText variant="bodyMedium" style={styles.title}>
          {tier.tierName}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {formatAdminShippingTierCountries(tier.countires)}
        </AppText>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onEdit} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <AppText variant="caption" style={styles.actionText}>
              Edit
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onMatrix} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <AppText variant="caption" style={styles.actionText}>
              Matrix
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            style={({ pressed }) => [styles.action, styles.deleteAction, pressed && styles.pressed]}
          >
            <AppText variant="caption" style={styles.deleteText}>
              Delete
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    width: 4,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.small,
    backgroundColor: colors.surfaceMuted,
  },
  deleteAction: {
    backgroundColor: colors.errorBg,
  },
  pressed: {
    opacity: 0.88,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  deleteText: {
    color: colors.error,
    fontWeight: '600',
  },
});
