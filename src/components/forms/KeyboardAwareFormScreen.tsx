import {
  useCallback,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type FocusEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type TextInputFocusEventData,
  type ViewStyle,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../design-system';

/** KeyboardAwareScrollView scrolls focused fields into view — manual focus scroll is unnecessary. */
const noopFieldFocus = (_event?: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => {};

export interface KeyboardAwareFormControls {
  onFieldFocus: (event?: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => void;
  bindScrollProps: (
    scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>,
  ) => Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>;
  contentPaddingBottom: number;
}

export function useKeyboardAwareForm(
  _scrollRef?: RefObject<ScrollView | null>,
  _keyboardExtraOffset: number = spacing.xxl,
): KeyboardAwareFormControls {
  const insets = useSafeAreaInsets();

  const bindScrollProps = useCallback(
    (
      scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'>,
    ): Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'ref'> => ({
      keyboardShouldPersistTaps: 'handled',
      keyboardDismissMode: 'interactive',
      showsVerticalScrollIndicator: false,
      ...scrollProps,
    }),
    [],
  );

  return {
    onFieldFocus: noopFieldFocus,
    bindScrollProps,
    contentPaddingBottom: spacing.lg + insets.bottom,
  };
}

export function useScrollToFieldOnFocus(_scrollRef: RefObject<ScrollView | null>) {
  return noopFieldFocus;
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
  /** Optional sticky footer (e.g. save/actions) that lifts above the keyboard. */
  footer?: ReactNode;
  /** Reserved height for sticky footer when computing scroll bottom offset. */
  stickyFooterHeight?: number;
}

export function KeyboardAwareFormScreen({
  children,
  scrollRef: scrollRefProp,
  scrollProps,
  contentContainerStyle,
  wrapperStyle,
  formControls,
  keyboardExtraOffset = spacing.xxl,
  footer,
  stickyFooterHeight = 72,
}: KeyboardAwareFormScreenProps) {
  const insets = useSafeAreaInsets();
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = scrollRefProp ?? internalScrollRef;
  const internalControls = useKeyboardAwareForm(scrollRef, keyboardExtraOffset);
  const { bindScrollProps, contentPaddingBottom } = formControls ?? internalControls;

  const bottomOffset =
    keyboardExtraOffset + insets.bottom + (footer ? stickyFooterHeight + spacing.sm : 0);

  const scrollView = (
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={styles.flex}
      contentContainerStyle={[contentContainerStyle, { paddingBottom: contentPaddingBottom }]}
      bottomOffset={bottomOffset}
      {...bindScrollProps(scrollProps)}
    >
      {children}
    </KeyboardAwareScrollView>
  );

  if (!footer) {
    return <View style={[styles.flex, wrapperStyle]}>{scrollView}</View>;
  }

  return (
    <View style={[styles.flex, wrapperStyle]}>
      {scrollView}
      <KeyboardStickyView offset={{ closed: 0, opened: spacing.sm }}>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          {footer}
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
});
