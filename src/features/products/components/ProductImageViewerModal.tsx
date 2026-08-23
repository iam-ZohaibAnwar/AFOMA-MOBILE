import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, spacing } from '../../../design-system';
import type { ProductGalleryImage } from '../utils/productGallery';
import { ProductImageMagnifier } from './ProductImageMagnifier';

export interface ProductImageViewerModalProps {
  visible: boolean;
  images: ProductGalleryImage[];
  initialIndex?: number;
  productName: string;
  onClose: () => void;
}

export function ProductImageViewerModal({
  visible,
  images,
  initialIndex = 0,
  productName,
  onClose,
}: ProductImageViewerModalProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setSelectedIndex(initialIndex);
    }
  }, [initialIndex, visible]);

  const selectedImage = images[selectedIndex];

  const thumbnailSize = useMemo(() => {
    const count = Math.max(images.length, 1);
    const available = screenWidth - spacing.lg * 2 - spacing.sm * (count - 1);
    return Math.min(72, Math.max(56, available / count));
  }, [images.length, screenWidth]);

  if (!visible || images.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <AppText variant="bodyMedium" style={styles.headerTitle} numberOfLines={1}>
            {productName}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close image viewer"
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <AppText variant="h2" style={styles.closeIcon}>
              ×
            </AppText>
          </Pressable>
        </View>

        <View style={styles.viewerBody}>
          {images.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous image"
              disabled={selectedIndex === 0}
              onPress={() => setSelectedIndex((current) => Math.max(0, current - 1))}
              style={({ pressed }) => [
                styles.navButton,
                styles.navButtonLeft,
                selectedIndex === 0 && styles.navButtonDisabled,
                pressed && selectedIndex > 0 && styles.pressed,
              ]}
            >
              <AppText variant="h2" style={styles.navIcon}>
                ‹
              </AppText>
            </Pressable>
          ) : null}

          <View style={styles.magnifierFrame}>
            {selectedImage ? (
              <ProductImageMagnifier uri={selectedImage.url} accessibilityLabel={productName} />
            ) : null}
          </View>

          {images.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next image"
              disabled={selectedIndex >= images.length - 1}
              onPress={() =>
                setSelectedIndex((current) => Math.min(images.length - 1, current + 1))
              }
              style={({ pressed }) => [
                styles.navButton,
                styles.navButtonRight,
                selectedIndex >= images.length - 1 && styles.navButtonDisabled,
                pressed && selectedIndex < images.length - 1 && styles.pressed,
              ]}
            >
              <AppText variant="h2" style={styles.navIcon}>
                ›
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {images.map((image, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Pressable
                  key={image.id}
                  accessibilityRole="button"
                  accessibilityLabel={`View image ${index + 1}`}
                  onPress={() => setSelectedIndex(index)}
                  style={[
                    styles.thumbnail,
                    {
                      width: thumbnailSize,
                      height: thumbnailSize,
                      borderColor: isSelected ? colors.surface : 'transparent',
                    },
                  ]}
                >
                  <Image source={{ uri: image.url }} style={styles.thumbnailImage} resizeMode="cover" />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: colors.textInverse,
    fontWeight: '700',
  },
  closeButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.textInverse,
    lineHeight: 32,
  },
  viewerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  magnifierFrame: {
    flex: 1,
    minHeight: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  navButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  navButtonLeft: {
    marginRight: spacing.xs,
  },
  navButtonRight: {
    marginLeft: spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navIcon: {
    color: colors.textPrimary,
    lineHeight: 28,
  },
  thumbnailRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  thumbnail: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
});
