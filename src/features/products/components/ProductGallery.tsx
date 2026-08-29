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
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductGalleryImage } from '../utils/productGallery';
import { ProductGalleryHeroChrome, type ProductGalleryHeroChromeProps } from './ProductGalleryHeroChrome';
import { ProductImageViewerModal } from './ProductImageViewerModal';

export interface ProductGalleryProps {
  images: ProductGalleryImage[];
  productName: string;
  theme: PdpTheme;
  onLayout?: (event: LayoutChangeEvent) => void;
  chrome?: Omit<ProductGalleryHeroChromeProps, 'theme'> | null;
}

export function ProductGallery({
  images,
  productName,
  theme,
  onLayout,
  chrome,
}: ProductGalleryProps) {
  const insets = useSafeAreaInsets();
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

  const hasMultipleImages = galleryImages.length > 1;
  const footerBottom = spacing.xl + 8;

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={{ backgroundColor: theme.background }} onLayout={onLayout}>
      <View style={{ paddingTop: insets.top, backgroundColor: theme.surfaceMuted }}>
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
                  resizeMode="contain"
                  accessibilityLabel={productName}
                  onError={() =>
                    setFailedUrls((current) => {
                      const next = new Set(current);
                      next.add(image.url);
                      return next;
                    })
                  }
                />
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

        {hasMultipleImages ? (
          <View style={[styles.galleryFooter, { bottom: footerBottom }]}>
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

            <View style={[styles.imageCounter, { backgroundColor: theme.imageCounterBg }]}>
              <AppText variant="caption" style={[styles.imageCounterText, { color: theme.imageCounterText }]}>
                {selectedIndex + 1} / {galleryImages.length}
              </AppText>
            </View>
          </View>
        ) : null}

        {chrome ? (
          <ProductGalleryHeroChrome theme={theme} overlayTop={spacing.xs} {...chrome} />
        ) : null}
        </View>
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
    aspectRatio: 1,
    position: 'relative',
  },
  heroImage: {
    aspectRatio: 1,
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 28,
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    left: spacing.md,
    top: 0,
    bottom: 0,
    zIndex: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounterText: {
    fontWeight: '700',
  },
  dotsRow: {
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
