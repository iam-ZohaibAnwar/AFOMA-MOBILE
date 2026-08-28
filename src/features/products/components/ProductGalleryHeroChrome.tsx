import type { ReactNode } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { BackChevronIcon } from '../../../components/ui/BackChevronIcon';

import { MessageIcon } from '../../../components/ui/MessageIcon';

import { ShareIcon } from '../../../components/ui/ShareIcon';

import { layout, shadows, spacing } from '../../../design-system';

import type { PdpTheme } from '../../../design-system/pdpTheme';



export interface ProductGalleryHeroChromeProps {

  theme: PdpTheme;

  onBackPress: () => void;

  onSharePress?: () => void;

  onMessagePress?: () => void;

  /** When the gallery already applies safe-area padding, pass a small offset only. */
  overlayTop?: number;

}



function OverlayIconButton({
  theme,
  onPress,
  accessibilityLabel,
  children,
}: {
  theme: PdpTheme;
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: theme.floatingButtonBg,
          borderColor: theme.floatingButtonBorder,
        },
        shadows.floating,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}



export function ProductGalleryHeroChrome({

  theme,

  onBackPress,

  onSharePress,

  onMessagePress,

  overlayTop,

}: ProductGalleryHeroChromeProps) {

  const insets = useSafeAreaInsets();

  const iconColor = theme.textPrimary;

  const top = overlayTop ?? insets.top + spacing.xs;



  return (

    <View pointerEvents="box-none" style={[styles.topRow, { top }]}>

      <OverlayIconButton theme={theme} onPress={onBackPress} accessibilityLabel="Go back">
        <BackChevronIcon color={iconColor} size={13} strokeWidth={2} />
      </OverlayIconButton>

      <View style={styles.topActions}>
        {onMessagePress ? (
          <OverlayIconButton theme={theme} onPress={onMessagePress} accessibilityLabel="Message seller">
            <MessageIcon color={iconColor} size={18} />
          </OverlayIconButton>
        ) : null}
        {onSharePress ? (
          <OverlayIconButton theme={theme} onPress={onSharePress} accessibilityLabel="Share product">
            <ShareIcon color={iconColor} size={18} />
          </OverlayIconButton>
        ) : null}

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  topRow: {

    position: 'absolute',

    left: spacing.md,

    right: spacing.md,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    zIndex: 20,

  },

  topActions: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.xs,

  },

  iconButton: {
    width: layout.minTouchTarget - 4,
    height: layout.minTouchTarget - 4,
    borderRadius: (layout.minTouchTarget - 4) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {

    opacity: 0.88,

  },

});


