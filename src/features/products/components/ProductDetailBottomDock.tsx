import { useEffect, useRef } from 'react';

import { Animated, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { MarketplaceFooterPill } from '../../../app/navigation/marketplaceChrome/MarketplaceFooterPill';

import {

  getMarketplaceFooterSafeInset,

  MARKETPLACE_FOOTER_BOTTOM_GAP,

  MARKETPLACE_FOOTER_PILL_HEIGHT,

} from '../../../app/navigation/marketplaceChrome/marketplaceFooterLayout';

import { AppText } from '../../../components/ui/AppText';

import { motion, spacing } from '../../../design-system';

import type { PdpTheme } from '../../../design-system/pdpTheme';

import type { ProductDetailAddToCartCtaMode } from './ProductDetailStickyBar';
import { ProductDetailAddToCartCta } from './ProductDetailStickyBar';

export type ProductDetailBottomDockMode = 'footer' | 'cart' | 'hidden';

export interface ProductDetailBottomDockProps {
  mode: ProductDetailBottomDockMode;
  theme: PdpTheme;
  buttonLabel: string;
  disabled: boolean;
  ctaMode: ProductDetailAddToCartCtaMode;
  onPress: () => void;
  errorMessage?: string | null;
}



const DOCK_SLIDE_PX = 10;



export function ProductDetailBottomDock({
  mode,
  theme,
  buttonLabel,
  disabled,
  ctaMode,
  onPress,
  errorMessage,
}: ProductDetailBottomDockProps) {

  const insets = useSafeAreaInsets();

  const safeBottom = getMarketplaceFooterSafeInset(insets.bottom);

  const footerOpacity = useRef(new Animated.Value(mode === 'footer' ? 1 : 0)).current;

  const cartOpacity = useRef(new Animated.Value(mode === 'cart' ? 1 : 0)).current;

  const footerTranslateY = useRef(new Animated.Value(mode === 'footer' ? 0 : DOCK_SLIDE_PX)).current;

  const cartTranslateY = useRef(new Animated.Value(mode === 'cart' ? 0 : DOCK_SLIDE_PX)).current;



  useEffect(() => {

    const showFooter = mode === 'footer';

    const showCart = mode === 'cart';



    Animated.parallel([

      Animated.timing(footerOpacity, {

        toValue: showFooter ? 1 : 0,

        duration: motion.contentFadeMs,

        useNativeDriver: true,

      }),

      Animated.timing(cartOpacity, {

        toValue: showCart ? 1 : 0,

        duration: motion.contentFadeMs,

        useNativeDriver: true,

      }),

      Animated.timing(footerTranslateY, {

        toValue: showFooter ? 0 : DOCK_SLIDE_PX,

        duration: motion.contentFadeMs,

        useNativeDriver: true,

      }),

      Animated.timing(cartTranslateY, {

        toValue: showCart ? 0 : DOCK_SLIDE_PX,

        duration: motion.contentFadeMs,

        useNativeDriver: true,

      }),

    ]).start();

  }, [cartOpacity, cartTranslateY, footerOpacity, footerTranslateY, mode]);



  return (

    <View

      pointerEvents="box-none"

      style={[

        styles.dock,

        {

          paddingBottom: safeBottom + MARKETPLACE_FOOTER_BOTTOM_GAP,

        },

      ]}

    >

      <View pointerEvents="box-none" style={styles.stack}>

        <Animated.View

          pointerEvents={mode === 'footer' ? 'auto' : 'none'}

          style={[

            styles.layer,

            {

              opacity: footerOpacity,

              transform: [{ translateY: footerTranslateY }],

            },

          ]}

        >

          <MarketplaceFooterPill />

        </Animated.View>



        <Animated.View

          pointerEvents={mode === 'cart' ? 'auto' : 'none'}

          style={[

            styles.layer,

            {

              opacity: cartOpacity,

              transform: [{ translateY: cartTranslateY }],

            },

          ]}

        >

          <View style={styles.cartSlot}>

            {errorMessage ? (

              <AppText variant="bodySmall" color="error" style={styles.errorText}>

                {errorMessage}

              </AppText>

            ) : null}



            <ProductDetailAddToCartCta
              theme={theme}
              buttonLabel={buttonLabel}
              disabled={disabled}
              mode={ctaMode}
              onPress={onPress}
              floating
            />

          </View>

        </Animated.View>

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  dock: {

    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    paddingHorizontal: spacing.lg,

    paddingTop: spacing.sm,

    zIndex: 50,

  },

  stack: {

    minHeight: MARKETPLACE_FOOTER_PILL_HEIGHT,

    position: 'relative',

  },

  layer: {

    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

  },

  cartSlot: {

    gap: spacing.sm,

  },

  errorText: {

    textAlign: 'center',

  },

});


