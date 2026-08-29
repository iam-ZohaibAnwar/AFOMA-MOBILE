import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import {
  countCompletedSetupSections,
  SELLER_SETUP_SECTION_COUNT,
} from '../../utils/sellerSetupSections';
import type { SellerProfileSetup } from '../../types/sellerProfile';
import { sellerDashboardTheme } from '../utils/sellerDashboardTheme';

export interface SellerDashboardSetupAlertProps {
  profileSetup?: SellerProfileSetup;
  onContinue: () => void;
}

export function SellerDashboardSetupAlert({ profileSetup, onContinue }: SellerDashboardSetupAlertProps) {
  const completedCount = countCompletedSetupSections(profileSetup);
  const progressRatio = completedCount / SELLER_SETUP_SECTION_COUNT;

  return (
    <View style={styles.card}>
      <View style={styles.alertTop}>
        <View style={styles.alertCopy}>
          <AppText variant="bodyMedium" style={styles.alertTitle}>
            Finish setting up your shop
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {completedCount} of {SELLER_SETUP_SECTION_COUNT} sections complete. Finish setup before listing products.
          </AppText>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progressRatio * 100)}%` }]} />
          </View>
        </View>
        <View style={styles.alertIconWrap}>
          <Ionicons name="storefront-outline" size={22} color={sellerDashboardTheme.alertIconColor} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onContinue}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={styles.actionLabel}>
          Continue setup
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: sellerDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: sellerDashboardTheme.alertWarningCardBackground,
    borderColor: colors.border,
    ...shadows.card,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  alertCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  alertTitle: {
    color: colors.warningText,
    fontWeight: '700',
    fontSize: 17,
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: sellerDashboardTheme.alertWarningIconBackground,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: sellerDashboardTheme.alertReviewButton,
  },
  actionLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});
