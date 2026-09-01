import { type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { colors, radius, shadows, spacing } from '../../design-system';
import { useBottomSheetDismiss } from './bottomSheetDismiss';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  maxHeightRatio?: number;
  /** Estimated fixed height above the scroll area (handle + header). */
  chromeHeight?: number;
  backgroundColor?: string;
  sheetStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
  scrollable?: boolean;
  showHandle?: boolean;
}

const DEFAULT_MAX_HEIGHT_RATIO = 0.82;
const DEFAULT_CHROME_HEIGHT = 72;

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  header,
  footer,
  maxHeightRatio = DEFAULT_MAX_HEIGHT_RATIO,
  chromeHeight = DEFAULT_CHROME_HEIGHT,
  backgroundColor = colors.surface,
  sheetStyle,
  contentContainerStyle,
  scrollStyle,
  dismissOnBackdropPress = true,
  scrollable = true,
  showHandle = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { chromePanHandlers, scrollProps } = useBottomSheetDismiss(onClose);
  const sheetMaxHeight = Math.round(windowHeight * maxHeightRatio);
  const scrollMaxHeight = Math.max(
    160,
    sheetMaxHeight - chromeHeight - insets.bottom - spacing.md,
  );

  if (!visible) {
    return null;
  }

  const body = scrollable ? (
    <ScrollView
      style={[{ maxHeight: scrollMaxHeight }, scrollStyle]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

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
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View
          style={[
            styles.sheet,
            shadows.floating,
            {
              maxHeight: sheetMaxHeight,
              paddingBottom: insets.bottom + spacing.md,
              backgroundColor,
            },
            sheetStyle,
          ]}
        >
          <View {...chromePanHandlers}>
            {showHandle ? <View style={styles.handle} /> : null}

            {header ??
              (title ? (
                <View style={styles.titleRow}>
                  <AppText variant="h3" style={styles.title}>
                    {title}
                  </AppText>
                </View>
              ) : null)}
          </View>

          {body}
          {footer}
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
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
