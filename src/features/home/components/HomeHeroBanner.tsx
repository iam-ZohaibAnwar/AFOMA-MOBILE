import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import {
  colors,
  radius,
  screenPaddingHorizontal,
  sectionGap,
  shadows,
  spacing,
} from '../../../design-system';

interface HomeHeroBannerProps {
  onPress?: () => void;
}

export function HomeHeroBanner({ onPress }: HomeHeroBannerProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Shop summer deals"
        onPress={onPress}
        style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
      >
        <View style={styles.accentOrb} />
        <View style={styles.content}>
          <AppText variant="caption" color="textInverse" style={styles.eyebrow}>
            Summer deals
          </AppText>
          <AppText variant="h2" color="textInverse" style={styles.title}>
            Up to 40% off artisan finds
          </AppText>
          <AppText variant="bodySmall" style={styles.subtitle}>
            Curated picks from independent makers across the marketplace.
          </AppText>
          <View style={styles.ctaRow}>
            <View style={styles.ctaButton}>
              <AppText variant="button" color="primary" style={styles.ctaLabel}>
                Shop deals
              </AppText>
              <AppText variant="button" color="primary" style={styles.ctaArrow}>
                →
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: screenPaddingHorizontal,
    marginTop: spacing.lg,
    marginBottom: sectionGap - spacing.md,
  },
  banner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryPressed,
    minHeight: 168,
    ...shadows.floating,
  },
  bannerPressed: {
    opacity: 0.96,
  },
  accentOrb: {
    position: 'absolute',
    top: -36,
    right: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.secondary,
    opacity: 0.88,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    maxWidth: '82%',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    color: colors.primarySoft,
  },
  title: {
    color: colors.textInverse,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 20,
  },
  ctaRow: {
    marginTop: spacing.sm,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  ctaLabel: {
    color: colors.primary,
    fontSize: 14,
  },
  ctaArrow: {
    color: colors.secondary,
    fontSize: 16,
    lineHeight: 18,
  },
});
