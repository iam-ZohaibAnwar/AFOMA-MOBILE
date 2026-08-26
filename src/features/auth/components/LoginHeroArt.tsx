import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { AfomaLogo } from '../../../components/brand';
import { colors, radius, shadows, spacing } from '../../../design-system';

const COLLAGE_IMAGES = [
  require('../../../assets/images/subcategories/earrings.jpg'),
  require('../../../assets/images/subcategories/handcrafted-decor.jpg'),
  require('../../../assets/images/subcategories/notebooks-and-journals.jpg'),
];

export function LoginHeroArt() {
  return (
    <View style={styles.panel}>
      <View style={styles.logoWrap}>
        <AfomaLogo width={120} />
      </View>

      <AppText variant="bodyMedium" style={styles.tagline}>
        Shop handmade treasures from artisans around the world.
      </AppText>

      <View style={styles.collage}>
        {COLLAGE_IMAGES.map((source, index) => (
          <View
            key={index}
            style={[
              styles.tile,
              index === 1 ? styles.tileCenter : null,
              index === 2 ? styles.tileRight : null,
            ]}
          >
            <Image source={source} style={styles.tileImage} resizeMode="cover" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.card,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  collage: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.sm,
    minHeight: 112,
  },
  tile: {
    width: 88,
    height: 88,
    borderRadius: radius.large,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.background,
  },
  tileCenter: {
    width: 96,
    height: 96,
    marginBottom: spacing.md,
  },
  tileRight: {
    marginTop: spacing.sm,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
});
