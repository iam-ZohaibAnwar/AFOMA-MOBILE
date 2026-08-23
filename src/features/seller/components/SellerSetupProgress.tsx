import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import {
  countCompletedSetupSections,
  SELLER_SETUP_SECTION_COUNT,
} from '../utils/sellerSetupSections';
import type { SellerProfileSetup } from '../types/sellerProfile';

export interface SellerSetupProgressProps {
  profileSetup?: SellerProfileSetup;
  onContinue?: () => void;
  title?: string;
  subtitle?: string;
  continueLabel?: string;
}

export function SellerSetupProgress({
  profileSetup,
  onContinue,
  title,
  subtitle,
  continueLabel = 'Continue setup',
}: SellerSetupProgressProps) {
  const completedCount = countCompletedSetupSections(profileSetup);
  const isComplete = completedCount >= SELLER_SETUP_SECTION_COUNT;
  const progressRatio = completedCount / SELLER_SETUP_SECTION_COUNT;
  const heading = title ?? (isComplete ? 'Seller setup complete' : 'Complete your seller setup');

  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium" style={styles.title}>
        {heading}
      </AppText>

      {!isComplete ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {subtitle ?? 'Finish all required sections before creating products.'}
        </AppText>
      ) : null}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: progressRatio }]} />
        <View style={{ flex: Math.max(0, 1 - progressRatio) }} />
      </View>

      <AppText variant="bodySmall" color="textSecondary" style={styles.progressLabel}>
        {completedCount} / {SELLER_SETUP_SECTION_COUNT} sections complete
      </AppText>

      {!isComplete && onContinue ? (
        <AppButton label={continueLabel} onPress={onContinue} size="md" style={styles.continueButton} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 20,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginTop: spacing.xs,
  },
  progressFill: {
    backgroundColor: colors.primary,
    minWidth: 4,
  },
  progressLabel: {
    marginTop: spacing.xs,
  },
  continueButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
});
