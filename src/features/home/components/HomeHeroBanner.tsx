import { StyleSheet, Text, View } from 'react-native';

import { homeColors, homeRadii, homeShadows, homeSpacing, homeTypography } from '../theme/homeTheme';

export function HomeHeroBanner() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.banner}>
        <View style={styles.glow} />
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Handmade marketplace</Text>
          </View>
          <Text style={styles.title}>Shop unique crafts from global artisans</Text>
          <Text style={styles.subtitle}>
            Curated products, fair pricing, and stories behind every maker.
          </Text>
        </View>
        <View style={styles.accentBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: homeSpacing.screen,
    marginTop: homeSpacing.block,
    marginBottom: homeSpacing.section - 8,
  },
  banner: {
    borderRadius: homeRadii.lg,
    overflow: 'hidden',
    backgroundColor: homeColors.navy,
    minHeight: 156,
    ...homeShadows.card,
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(234, 88, 12, 0.22)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: homeRadii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.4,
    maxWidth: 320,
  },
  subtitle: {
    ...homeTypography.body,
    color: 'rgba(255, 255, 255, 0.82)',
    maxWidth: 340,
  },
  accentBar: {
    height: 5,
    backgroundColor: homeColors.primary,
  },
});
