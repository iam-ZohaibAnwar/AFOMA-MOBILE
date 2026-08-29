import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type TextInputFocusEventData,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../design-system';

type KeyboardMetrics = {
  height: number;
  screenY: number;
};

const EMPTY_KEYBOARD: KeyboardMetrics = { height: 0, screenY: 0 };

function resolveFocusNode(event: NativeSyntheticEvent<TextInputFocusEventData>): number | null {
  const target = event.nativeEvent.target ?? (event as { target?: unknown }).target;
  if (typeof target === 'number') {
    return target;
  }
  if (target) {
    return findNodeHandle(target as never);
  }
  return null;
}

function scrollFocusedFieldIntoView({
  scrollRef,
  scrollY,
  focusedNode,
  keyboard,
  extraOffset,
}: {
  scrollRef: RefObject<ScrollView | null>;
  scrollY: number;
  focusedNode: number | null;
  keyboard: KeyboardMetrics;
  extraOffset: number;
}) {
  if (!focusedNode || !scrollRef.current || keyboard.height <= 0) {
    return;
  }

  UIManager.measureInWindow(focusedNode, (_x, y, _width, height) => {
    const windowHeight = Dimensions.get('window').height;
    const keyboardTop =
      keyboard.screenY > 0 && keyboard.screenY < windowHeight
        ? keyboard.screenY
        : windowHeight - keyboard.height;
    const visibleBottom = keyboardTop - extraOffset;
    const fieldBottom = y + height;

    if (fieldBottom > visibleBottom) {
      const delta = fieldBottom - visibleBottom + spacing.md;
      scrollRef.current?.scrollTo({
        y: Math.max(0, scrollY + delta),
        animated: true,
      });
    }
  });
}

export interface KeyboardAwareFormControls {
  onFieldFocus: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  bindScrollProps: (
    scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>,
  ) => Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>;
  contentPaddingBottom: number;
}

export function useKeyboardAwareForm(
  scrollRef: RefObject<ScrollView | null>,
  keyboardExtraOffset = spacing.xxl,
): KeyboardAwareFormControls {
  const insets = useSafeAreaInsets();
  const scrollYRef = useRef(0);
  const focusedNodeRef = useRef<number | null>(null);
  const keyboardRef = useRef<KeyboardMetrics>(EMPTY_KEYBOARD);
  const [keyboard, setKeyboard] = useState<KeyboardMetrics>(EMPTY_KEYBOARD);

  const runScrollToFocusedField = useCallback(
    (delayMs = 0) => {
      const execute = () => {
        scrollFocusedFieldIntoView({
          scrollRef,
          scrollY: scrollYRef.current,
          focusedNode: focusedNodeRef.current,
          keyboard: keyboardRef.current,
          extraOffset: keyboardExtraOffset,
        });
      };

      if (delayMs > 0) {
        setTimeout(execute, delayMs);
        return;
      }

      execute();
    },
    [keyboardExtraOffset, scrollRef],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const nextKeyboard: KeyboardMetrics = {
        height: event.endCoordinates.height,
        screenY: event.endCoordinates.screenY,
      };
      keyboardRef.current = nextKeyboard;
      setKeyboard(nextKeyboard);
      runScrollToFocusedField(Platform.OS === 'ios' ? 50 : 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardRef.current = EMPTY_KEYBOARD;
      focusedNodeRef.current = null;
      setKeyboard(EMPTY_KEYBOARD);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [runScrollToFocusedField]);

  const onFieldFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      focusedNodeRef.current = resolveFocusNode(event);
      if (focusedNodeRef.current) {
        runScrollToFocusedField(Platform.OS === 'ios' ? 300 : 150);
        return;
      }

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 300 : 150);
    },
    [runScrollToFocusedField, scrollRef],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const bindScrollProps = useCallback(
    (
      scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>,
    ): Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'> => {
      const { onScroll: externalOnScroll, ...restScrollProps } = scrollProps ?? {};

      return {
        keyboardShouldPersistTaps: 'handled',
        keyboardDismissMode: 'on-drag',
        showsVerticalScrollIndicator: false,
        automaticallyAdjustKeyboardInsets: Platform.OS === 'ios',
        automaticallyAdjustContentInsets: false,
        contentInsetAdjustmentBehavior: 'never',
        scrollEventThrottle: 16,
        ...restScrollProps,
        onScroll: (event) => {
          handleScroll(event);
          externalOnScroll?.(event);
        },
      };
    },
    [handleScroll],
  );

  const contentPaddingBottom =
    spacing.lg + insets.bottom + (keyboard.height > 0 ? keyboard.height : 0);

  return {
    onFieldFocus,
    bindScrollProps,
    contentPaddingBottom,
  };
}

export function useScrollToFieldOnFocus(scrollRef: RefObject<ScrollView | null>) {
  return useKeyboardAwareForm(scrollRef).onFieldFocus;
}

export interface KeyboardAwareFormScreenProps {
  children: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  /** When provided, avoids creating a second keyboard listener in the screen wrapper. */
  formControls?: KeyboardAwareFormControls;
  keyboardExtraOffset?: number;
}

export function KeyboardAwareFormScreen({
  children,
  scrollRef: scrollRefProp,
  scrollProps,
  contentContainerStyle,
  wrapperStyle,
  formControls,
  keyboardExtraOffset = spacing.xxl,
}: KeyboardAwareFormScreenProps) {
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = scrollRefProp ?? internalScrollRef;
  const internalControls = useKeyboardAwareForm(scrollRef, keyboardExtraOffset);
  const { bindScrollProps, contentPaddingBottom } = formControls ?? internalControls;

  return (
    <View style={[styles.flex, wrapperStyle]}>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[contentContainerStyle, { paddingBottom: contentPaddingBottom }]}
        {...bindScrollProps(scrollProps)}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
