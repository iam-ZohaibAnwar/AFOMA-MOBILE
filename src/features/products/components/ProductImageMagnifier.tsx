import { useCallback, useState } from 'react';
import {
  Image,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
  type NativeTouchEvent,
} from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';

const LENS_SIZE = 150;
const DEFAULT_ZOOM = 2.8;

export interface ProductImageMagnifierProps {
  uri: string;
  accessibilityLabel: string;
  zoom?: number;
}

export function ProductImageMagnifier({
  uri,
  accessibilityLabel,
  zoom = DEFAULT_ZOOM,
}: ProductImageMagnifierProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [lens, setLens] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const updateLens = useCallback(
    (touch: NativeTouchEvent) => {
      if (layout.width <= 0 || layout.height <= 0) {
        return;
      }

      const x = Math.max(0, Math.min(touch.locationX, layout.width));
      const y = Math.max(0, Math.min(touch.locationY, layout.height));

      setLens({ x, y, visible: true });
    },
    [layout.height, layout.width],
  );

  const hideLens = useCallback(() => {
    setLens((current) => ({ ...current, visible: false }));
  }, []);

  const handleTouch = useCallback(
    (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      updateLens(event.nativeEvent);
    },
    [updateLens],
  );

  const lensLeft = lens.x - LENS_SIZE / 2;
  const lensTop = lens.y - LENS_SIZE / 2;

  return (
    <View style={styles.container}>
      <View
        style={styles.imageTouchArea}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={hideLens}
        onResponderTerminate={hideLens}
      >
        <Image
          source={{ uri }}
          style={[
            styles.image,
            layout.width > 0 ? { width: layout.width, height: layout.height } : styles.imageFallback,
          ]}
          resizeMode="contain"
          accessibilityLabel={accessibilityLabel}
        />

        {lens.visible && layout.width > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.lens,
              {
                width: LENS_SIZE,
                height: LENS_SIZE,
                borderRadius: LENS_SIZE / 2,
                left: lensLeft,
                top: lensTop,
              },
            ]}
          >
            <Image
              source={{ uri }}
              style={{
                width: layout.width * zoom,
                height: layout.height * zoom,
                transform: [
                  { translateX: -(lens.x * zoom - LENS_SIZE / 2) },
                  { translateY: -(lens.y * zoom - LENS_SIZE / 2) },
                ],
              }}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>

      <AppText variant="caption" style={styles.hint}>
        Drag on the image to zoom details
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
  },
  imageTouchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
  },
  lens: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  hint: {
    textAlign: 'center',
    color: '#64748B',
  },
});
