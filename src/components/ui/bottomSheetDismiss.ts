import { useCallback, useMemo, useRef } from 'react';
import { PanResponder, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

export const BOTTOM_SHEET_DISMISS_DRAG_THRESHOLD = 72;
export const BOTTOM_SHEET_DISMISS_OVERSCROLL_THRESHOLD = 36;
export const BOTTOM_SHEET_DISMISS_VELOCITY = 0.85;

export function shouldDismissBottomSheet(dy: number, vy: number): boolean {
  return dy > BOTTOM_SHEET_DISMISS_DRAG_THRESHOLD || vy > BOTTOM_SHEET_DISMISS_VELOCITY;
}

export function useBottomSheetDismiss(onClose: () => void) {
  const scrollOffsetYRef = useRef(0);

  const dismissFromDrag = useCallback(
    (dy: number, vy: number) => {
      if (shouldDismissBottomSheet(dy, vy)) {
        onClose();
      }
    },
    [onClose],
  );

  const chromePanHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderRelease: (_, gestureState) => {
          dismissFromDrag(gestureState.dy, gestureState.vy);
        },
      }).panHandlers,
    [dismissFromDrag],
  );

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, velocity } = event.nativeEvent;

      if (contentOffset.y < -BOTTOM_SHEET_DISMISS_OVERSCROLL_THRESHOLD) {
        onClose();
        return;
      }

      if (contentOffset.y <= 0 && velocity.y > BOTTOM_SHEET_DISMISS_VELOCITY) {
        onClose();
      }
    },
    [onClose],
  );

  return {
    chromePanHandlers,
    scrollProps: {
      scrollEventThrottle: 16 as const,
      bounces: true,
      alwaysBounceVertical: true,
      onScroll,
      onScrollEndDrag,
    },
  };
}
