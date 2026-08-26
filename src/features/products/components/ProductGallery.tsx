import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductGalleryImage } from '../utils/productGallery';
import { ProductImageViewerModal } from './ProductImageViewerModal';

export interface ProductGalleryProps {
  images: ProductGalleryImage[];
  productName: string;
  theme: PdpTheme;
}

export function ProductGallery({
  images,
  productName,
  theme,
}: ProductGalleryProps) {
  const scrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const galleryImages = useMemo(
    () => images.filter((image) => !failedUrls.has(image.url)),
    [failedUrls, images],
  );

  useEffect(() => {
    if (selectedIndex >= galleryImages.length) {
      setSelectedIndex(0);
    }
  }, [galleryImages.length, selectedIndex]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setSelectedIndex(nextIndex);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={{ backgroundColor: theme.background }}>
      <View style={[styles.hero, { backgroundColor: theme.surfaceMuted }]}>
        {galleryImages.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
          >
            {galleryImages.map((image, index) => (
              <Pressable
                key={image.id}
                accessibilityRole="button"
                accessibilityLabel={`Open full image ${index + 1} of ${galleryImages.length}`}
                onPress={() => openViewer(index)}
                style={{ width: screenWidth }}
              >
                <Image
                  source={{ uri: image.url }}
                  style={[styles.heroImage, { width: screenWidth }]}
                  resizeMode="cover"
                  accessibilityLabel={productName}
                  onError={() =>
                    setFailedUrls((current) => {
                      const next = new Set(current);
                      next.add(image.url);
                      return next;
                    })
                  }
                />
                <View style={styles.expandBadge}>
                  <AppText variant="caption" style={styles.expandBadgeText}>
                    Tap to zoom
                  </AppText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: theme.surfaceMuted }]}>
            <AppText variant="bodySmall" color="textMuted">
              No image
            </AppText>
          </View>
        )}

        {galleryImages.length > 1 ? (
          <View style={styles.dotsRow}>
            {galleryImages.map((image, index) => {
              const isActive = index === selectedIndex;

              return (
                <View
                  key={image.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isActive ? colors.primary : colors.borderStrong,
                      opacity: isActive ? 1 : 0.55,
                      width: isActive ? 18 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>
        ) : null}
      </View>

      <ProductImageViewerModal
        visible={viewerVisible}
        images={galleryImages}
        initialIndex={viewerIndex}
        productName={productName}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 1.05,
    position: 'relative',
  },
  heroImage: {
    aspectRatio: 1.05,
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBadge: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl + 28,
    minHeight: layout.minTouchTarget - 8,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 37, 84, 0.45)',
  },
  expandBadgeText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.xl + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
});
