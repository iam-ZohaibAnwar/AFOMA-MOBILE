import { useMemo, useRef, type ReactNode } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

const SHEET_HEIGHT_RATIO = 0.85;
const SHEET_CHROME_HEIGHT = 72;
const DISMISS_DRAG_THRESHOLD = 72;
const DISMISS_OVERSCROLL_THRESHOLD = 36;

export interface ProductDetailBottomSheetProps {
  visible: boolean;
  title: string;
  theme: PdpTheme;
  onClose: () => void;
  children: ReactNode;
}

export function ProductDetailBottomSheet({
  visible,
  title,
  theme,
  onClose,
  children,
}: ProductDetailBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const scrollOffsetYRef = useRef(0);
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const scrollMaxHeight = Math.max(
    220,
    sheetMaxHeight - SHEET_CHROME_HEIGHT - insets.bottom - spacing.md,
  );

  const dismissIfDraggedDown = (dy: number, vy: number) => {
    if (dy > DISMISS_DRAG_THRESHOLD || vy > 0.85) {
      onClose();
    }
  };

  const chromePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderRelease: (_, gestureState) => {
          dismissIfDraggedDown(gestureState.dy, gestureState.vy);
        },
      }),
    [onClose],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, velocity } = event.nativeEvent;

    if (contentOffset.y < -DISMISS_OVERSCROLL_THRESHOLD) {
      onClose();
      return;
    }

    if (contentOffset.y <= 0 && velocity.y > 0.85) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.backdrop}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              paddingBottom: insets.bottom + spacing.md,
              backgroundColor: theme.surface,
            },
          ]}
        >
          <View {...chromePanResponder.panHandlers}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
                {title}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <AppText variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '700' }}>
                  ✕
                </AppText>
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={{ maxHeight: scrollMaxHeight }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces
            alwaysBounceVertical
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEndDrag}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
});
