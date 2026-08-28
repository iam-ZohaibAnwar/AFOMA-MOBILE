import { useLayoutEffect, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FadeInContent } from '../../../components/motion';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { usePricing } from '../../../app/providers/PricingProvider';

import { AppText } from '../../../components/ui/AppText';

import { colors, spacing } from '../../../design-system';

import { usePdpTheme } from '../../../design-system/pdpTheme';

import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { navigateToCartTab, navigateToShop } from '../../../app/navigation/shoppingNavigation';
import { ProductDetailBottomDock, type ProductDetailBottomDockMode } from '../components/ProductDetailBottomDock';
import { useMarketplaceFooterContentInset } from '../../../app/navigation/marketplaceChrome';

import {
  AddToCartValidationError,
  addProductToCart,
} from '../../cart/utils/addProductToCart';
import { notifyFlyToCart } from '../../cart/utils/cartFeedback';
import { useCart } from '../../cart/hooks/useCart';

import { buildAddToCartInputFromPdp } from '../../cart/utils/cartLineMerge';

import { getErrorMessage } from '../../../services/api/errors';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';

import { ProductDetailItemDetailsSection } from '../components/ProductDetailItemDetailsSection';
import { ProductDetailPoliciesSection } from '../components/ProductDetailPoliciesSection';
import { ProductDetailReviewsSection } from '../components/ProductDetailReviewsSection';
import { ProductMeetSellerSection } from '../components/ProductMeetSellerSection';

import { ProductDetailHeader } from '../components/ProductDetailHeader';

import {
  ProductDetailAddToCartCta,
  type ProductDetailAddToCartCtaMode,
} from '../components/ProductDetailStickyBar';

import { ProductGallery } from '../components/ProductGallery';

import { ProductVariationSelectors } from '../components/ProductVariationSelectors';

import { SuggestedProductsSection } from '../components/SuggestedProductsSection';

import { useProductDetail } from '../hooks/useProductDetail';

import { useProductDetailRecommendations } from '../hooks/useProductDetailRecommendations';

import { useProductDetailVariations } from '../hooks/useProductDetailVariations';

import { useProductReviews } from '../hooks/useProductReviews';

import { getProductGalleryImages } from '../utils/productGallery';
import { getProductShareUrl } from '../utils/productShare';
import { promptProductShare } from '../utils/shareProduct';
import {
  buildProductDetailAuthReturnTo,
  canShowProductSellerMessage,
  openProductSellerChat,
} from '../utils/productSellerChat';

import {

  getProductCompareAtPriceForSelection,

  getProductDiscountPercent,

  getProductDisplayName,

  getProductImageUrl,

  getProductPriceForSelection,

  getProductRouteId,

  getSellerDisplayName,
  getSellerStorePolicy,
  hasDisplayableStorePolicy,
} from '../utils/productDisplay';



type Props = NativeStackScreenProps<ShoppingStackParamList, 'ProductDetail'>;

const CONTENT_SHEET_OVERLAP = 16;
const SCROLL_DELTA_THRESHOLD = 8;
const AT_TOP_SCROLL_THRESHOLD = 24;



export function ProductDetailScreen({ route, navigation }: Props) {

  const { productId, slug, openChat } = route.params;
  const footerInset = useMarketplaceFooterContentInset();
  const scrollContentRef = useRef<View>(null);
  const inlineCtaRef = useRef<View>(null);
  const scrollViewHeightRef = useRef(0);
  const inlineCtaYRef = useRef(0);
  const inlineCtaHeightRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const previousScrollYRef = useRef(0);
  const footerScrollVisibleRef = useRef(true);
  const dockModeRef = useRef<ProductDetailBottomDockMode>('footer');
  const openChatHandledRef = useRef(false);
  const [dockMode, setDockMode] = useState<ProductDetailBottomDockMode>('footer');

  const measureInlineCtaPosition = useCallback(() => {
    const scrollContent = scrollContentRef.current;
    const inlineNode = inlineCtaRef.current;
    if (!scrollContent || !inlineNode) {
      return;
    }

    inlineNode.measureLayout(
      scrollContent,
      (_x, y, _width, height) => {
        inlineCtaYRef.current = y;
        inlineCtaHeightRef.current = height;
      },
      () => {},
    );
  }, []);

  const syncBottomDock = useCallback(
    (scrollY: number) => {
      const viewHeight = scrollViewHeightRef.current;
      const delta = scrollY - previousScrollYRef.current;
      previousScrollYRef.current = scrollY;
      lastScrollYRef.current = scrollY;

      if (scrollY <= 0) {
        footerScrollVisibleRef.current = true;
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        footerScrollVisibleRef.current = false;
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        footerScrollVisibleRef.current = true;
      }

      const showFooterOnScroll = footerScrollVisibleRef.current;

      const inlineTop = inlineCtaYRef.current;
      const inlineBottom = inlineTop + inlineCtaHeightRef.current;
      const viewportTop = scrollY + spacing.sm;
      const viewportBottom = scrollY + viewHeight - footerInset - spacing.sm;

      const hasInlineMetrics = inlineCtaHeightRef.current > 0;
      const inlineAboveViewport = hasInlineMetrics && inlineBottom <= viewportTop;
      const inlineBelowViewport = hasInlineMetrics && inlineTop >= viewportBottom;
      const inlineInViewport =
        hasInlineMetrics && !inlineAboveViewport && !inlineBelowViewport;

      let nextMode: ProductDetailBottomDockMode;

      if (!hasInlineMetrics) {
        nextMode = scrollY <= AT_TOP_SCROLL_THRESHOLD ? 'footer' : 'cart';
      } else if (inlineInViewport) {
        // Inline Add to Cart is on screen — defer to it; tabs return on scroll-up.
        nextMode = showFooterOnScroll ? 'footer' : 'hidden';
      } else if (scrollY <= AT_TOP_SCROLL_THRESHOLD) {
        nextMode = 'footer';
      } else {
        // Inline is above or below the viewport — keep sticky Add to Cart visible.
        nextMode = 'cart';
      }

      if (nextMode === dockModeRef.current) {
        return;
      }

      dockModeRef.current = nextMode;
      setDockMode(nextMode);
    },
    [footerInset],
  );

  const handleScrollViewLayout = useCallback(
    (event: LayoutChangeEvent) => {
      scrollViewHeightRef.current = event.nativeEvent.layout.height;
      syncBottomDock(lastScrollYRef.current);
    },
    [syncBottomDock],
  );

  const handleInlineCtaLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measureInlineCtaPosition();
      requestAnimationFrame(() => {
        syncBottomDock(lastScrollYRef.current);
      });
    },
    [measureInlineCtaPosition, syncBottomDock],
  );

  const handleContentAboveInlineLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measureInlineCtaPosition();
      requestAnimationFrame(() => {
        syncBottomDock(lastScrollYRef.current);
      });
    },
    [measureInlineCtaPosition, syncBottomDock],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncBottomDock(event.nativeEvent.contentOffset.y);
    },
    [syncBottomDock],
  );

  const resetBottomDock = useCallback(() => {
    dockModeRef.current = 'footer';
    setDockMode('footer');
    lastScrollYRef.current = 0;
    previousScrollYRef.current = 0;
    footerScrollVisibleRef.current = true;
    inlineCtaYRef.current = 0;
    inlineCtaHeightRef.current = 0;
  }, []);

  const theme = usePdpTheme();

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const authUserId = resolveAuthUserId(user);

  const { userInfo } = usePricing();

  const { cart } = useCart(authUserId, userInfo);
  const { product, isRefreshing, error, retry } = useProductDetail(productId, slug);

  const { sellerProducts, relatedProducts, recentlyViewedProducts } =
    useProductDetailRecommendations(product);

  const variationState = useProductDetailVariations(product);

  const productRouteId = product ? getProductRouteId(product) : undefined;

  const {
    averageRating,
    reviewAverages,
    reviewCount,
    reviews,
    isLoading: isReviewsLoading,
  } = useProductReviews(productRouteId);



  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const isSelectionInCart = useMemo(() => {
    if (!variationState.cartKey || !variationState.canAddToCart) {
      return false;
    }

    return Boolean(cart[variationState.cartKey]);
  }, [cart, variationState.canAddToCart, variationState.cartKey]);

  const triggerFlyToCartFeedback = useCallback(() => {
    if (!product) {
      return;
    }

    const imageUrl = getProductImageUrl(product);
    const launchFly = (fromX: number, fromY: number) => {
      notifyFlyToCart({ imageUrl, fromX, fromY });
    };

    const measureNode = (node: View | null, fallbackY: number) => {
      if (!node) {
        const { width } = Dimensions.get('window');
        launchFly(width / 2, fallbackY);
        return;
      }

      node.measureInWindow((x, y, width, height) => {
        launchFly(x + width / 2, y + height / 2);
      });
    };

    const { width, height } = Dimensions.get('window');
    const dockFallbackY = height - footerInset - spacing.xl * 2;

    if (dockModeRef.current === 'cart' || dockModeRef.current === 'hidden') {
      measureNode(inlineCtaRef.current, dockFallbackY);
      return;
    }

    measureNode(inlineCtaRef.current, height * 0.72);
  }, [footerInset, product]);

  useEffect(() => {
    setCartError(null);
    resetBottomDock();
    openChatHandledRef.current = false;
    const frame = requestAnimationFrame(() => {
      measureInlineCtaPosition();
      syncBottomDock(0);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    measureInlineCtaPosition,
    productRouteId,
    resetBottomDock,
    syncBottomDock,
    variationState.cartKey,
  ]);



  useLayoutEffect(() => {

    navigation.setOptions({ headerShown: false });

  }, [navigation]);



  const galleryImages = useMemo(

    () => (product ? getProductGalleryImages(product, variationState.matchingVariation) : []),

    [product, variationState.matchingVariation],

  );



  const selectedPrice = product
    ? getProductPriceForSelection(product, variationState.selectedAttributes)
    : undefined;

  const compareAtPrice = product

    ? getProductCompareAtPriceForSelection(product, variationState.selectedAttributes)

    : undefined;

  const discountPercent = product ? getProductDiscountPercent(product) : undefined;
  const sellerName = product ? getSellerDisplayName(product) : undefined;
  const sellerStoreSlug = product?.seller?.storeSlug?.trim();
  const sellerLogoUrl = product?.seller?.storeLogo || product?.seller?.userProfile;
  const sellerStorePolicy = product ? getSellerStorePolicy(product) : undefined;
  const showSellerPolicies = hasDisplayableStorePolicy(sellerStorePolicy);
  const showSellerMessage = canShowProductSellerMessage({
    seller: product?.seller,
    authUserId,
  });
  const productAuthReturnTo = useMemo(
    () => buildProductDetailAuthReturnTo(productRouteId, product?.slug),
    [product?.slug, productRouteId],
  );

  const handleVisitShop = useCallback(() => {
    if (sellerStoreSlug) {
      navigateToShop(navigation, sellerStoreSlug);
    }
  }, [navigation, sellerStoreSlug]);

  const handleSharePress = useCallback(() => {
    if (!product) {
      return;
    }

    const shareUrl = getProductShareUrl(product.slug, getProductRouteId(product));
    if (!shareUrl) {
      Alert.alert('Unable to share', 'This product does not have a shareable link yet.');
      return;
    }

    promptProductShare({
      title: getProductDisplayName(product),
      url: shareUrl,
    });
  }, [product]);

  const handleMessageSeller = useCallback(() => {
    openProductSellerChat({
      navigation,
      seller: product?.seller,
      isAuthenticated,
      returnTo: productAuthReturnTo,
    });
  }, [isAuthenticated, navigation, product?.seller, productAuthReturnTo]);

  useEffect(() => {
    if (!openChat || openChatHandledRef.current || isAuthLoading || !isAuthenticated || !product) {
      return;
    }

    if (!canShowProductSellerMessage({ seller: product.seller, authUserId })) {
      return;
    }

    openChatHandledRef.current = true;
    navigation.setParams({ openChat: undefined });

    openProductSellerChat({
      navigation,
      seller: product.seller,
      isAuthenticated: true,
      returnTo: productAuthReturnTo,
    });
  }, [
    authUserId,
    isAuthenticated,
    isAuthLoading,
    navigation,
    openChat,
    product,
    productAuthReturnTo,
  ]);

  const handleRecommendationPress = useCallback(
    (item: Product) => {
      const nextProductId = getProductRouteId(item);
      if (!nextProductId) {
        return;
      }

      navigation.push('ProductDetail', {
        productId: nextProductId,
        slug: item.slug,
      });
    },
    [navigation],
  );

  const handleAddToCart = async () => {

    if (!product || !variationState.canAddToCart) {

      if (variationState.selectionIncomplete) {

        setCartError('Select all product options before adding to cart.');

      } else if (variationState.outOfStock) {

        setCartError('This product is out of stock.');

      }

      return;

    }



    if (variationState.maxQuantity < 1) {

      setCartError('This product is out of stock.');

      return;

    }



    if (variationState.quantity > variationState.maxQuantity) {

      setCartError(`Maximum available quantity is ${variationState.maxQuantity}.`);

      return;

    }



    setIsAddingToCart(true);

    setCartError(null);



    try {

      const cartInput = buildAddToCartInputFromPdp({

        product,

        userInfo,

        quantity: variationState.quantity,

        selectedAttributes: variationState.selectedAttributes,

        cartKey: variationState.cartKey,

      });



      await addProductToCart(authUserId, product, userInfo, {
        quantity: cartInput.quantity,
        cartKey: cartInput.cartKey,
        selectedVariations: cartInput.selectedVariations,
        maxQuantity: cartInput.maxQuantity,
        mergeMode: 'increment',
      });

      triggerFlyToCartFeedback();

    } catch (err) {

      setCartError(
        err instanceof AddToCartValidationError
          ? err.message
          : getErrorMessage(err, 'Failed to add item to cart.'),
      );

    } finally {

      setIsAddingToCart(false);

    }

  };



  if (error && !product && !isRefreshing) {

    return (

      <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
        <HeaderBackButton onPress={() => navigation.goBack()} color={theme.textPrimary} />

        <AppText variant="bodySmall" color="error">

          {error ?? 'Product not found.'}

        </AppText>

        <Pressable style={styles.retryButton} onPress={() => void retry()}>

          <AppText variant="button" color="textPrimary">

            Try again

          </AppText>

        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>

          <AppText variant="bodyMedium" color="textPrimary">

            Go back

          </AppText>

        </Pressable>

      </View>

    );

  }



  const handleCtaPress = () => {
    if (isSelectionInCart) {
      navigateToCartTab(navigation);
      return;
    }

    void handleAddToCart();
  };

  const addButtonDisabled =

    !product || !variationState.canAddToCart || isAddingToCart || variationState.disabledBySeller;



  const addButtonLabel = variationState.disabledBySeller

    ? 'Unavailable'

    : variationState.selectionIncomplete

      ? 'Select options'

      : variationState.outOfStock

        ? 'Out of stock'

        : 'Add to Cart';

  const dockButtonLabel = addButtonLabel;
  const dockButtonDisabled = isSelectionInCart ? false : addButtonDisabled;
  const ctaMode: ProductDetailAddToCartCtaMode = isAddingToCart
    ? 'loading'
    : isSelectionInCart
      ? 'viewCart'
      : 'add';

  const quantityDisabled =

    addButtonDisabled || !variationState.showQuantityStepper || variationState.isDownloadable;

  const floatingCtaActive = dockMode === 'cart';
  const contentPaddingBottom = footerInset + spacing.xl;

  return (

    <FadeInContent style={styles.screen}>

    <View style={[styles.screenInner, { backgroundColor: theme.background }]}>

      {error && product ? (
        <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
          <AppText variant="bodySmall" color="error">
            {error}
          </AppText>
          <AppText variant="bodySmall" style={styles.refreshBannerAction}>
            Retry
          </AppText>
        </Pressable>
      ) : null}



      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onLayout={handleScrollViewLayout}
        onScroll={handleScroll}
        onContentSizeChange={() => {
          measureInlineCtaPosition();
          syncBottomDock(lastScrollYRef.current);
        }}
        scrollEventThrottle={16}
      >
        <View ref={scrollContentRef} collapsable={false} style={styles.scrollContent}>
        <ProductGallery
          images={galleryImages}
          productName={product ? getProductDisplayName(product) : ''}
          theme={theme}
          chrome={
            product
              ? {
                  onBackPress: () => navigation.goBack(),
                  onMessagePress: showSellerMessage ? handleMessageSeller : undefined,
                  onSharePress: handleSharePress,
                }
              : null
          }
        />



        <View
          style={[
            styles.contentSheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: contentPaddingBottom,
            },
          ]}
        >

          <View style={styles.contentAboveInline} onLayout={handleContentAboveInlineLayout}>
          <ProductDetailHeader

            productName={product ? getProductDisplayName(product) : ''}

            unitPrice={selectedPrice}

            compareAtPrice={compareAtPrice}

            discountPercent={discountPercent}

            averageRating={averageRating}

            reviewCount={reviewCount}

            productType={product?.productType}

            theme={theme}

            showQuantityStepper={variationState.showQuantityStepper}

            quantity={variationState.quantity}

            maxQuantity={variationState.maxQuantity}

            quantityDisabled={quantityDisabled}

            onDecrement={variationState.decrementQuantity}

            onIncrement={variationState.incrementQuantity}

            outOfStock={variationState.outOfStock}

            selectionIncomplete={variationState.selectionIncomplete}

          />

          {variationState.isCustomizable ? (

            <ProductVariationSelectors

              attributeNames={variationState.attributeNames}

              attributeOptions={variationState.attributeOptions}

              selectedAttributes={variationState.selectedAttributes}

              onSelectAttribute={variationState.selectAttribute}

              isOptionAvailable={variationState.isOptionAvailable}

              theme={theme}

            />

          ) : null}
          </View>

          <View
            ref={inlineCtaRef}
            collapsable={false}
            style={styles.inlineCtaSection}
            onLayout={handleInlineCtaLayout}
          >
            {cartError && !floatingCtaActive ? (
              <AppText variant="bodySmall" color="error" style={styles.inlineCartError}>
                {cartError}
              </AppText>
            ) : null}

            <View
              style={floatingCtaActive ? styles.inlineCtaGhost : undefined}
              pointerEvents={floatingCtaActive ? 'none' : 'auto'}
            >
              <ProductDetailAddToCartCta
                theme={theme}
                buttonLabel={dockButtonLabel}
                disabled={dockButtonDisabled}
                mode={ctaMode}
                onPress={handleCtaPress}
              />
            </View>
          </View>

          <ProductDetailReviewsSection
            averageRating={averageRating}
            reviewAverages={reviewAverages}
            reviewCount={reviewCount}
            reviews={reviews}
            isLoading={isReviewsLoading}
            theme={theme}
          />

          {product ? (
            <ProductDetailItemDetailsSection product={product} theme={theme} />
          ) : null}

          {showSellerPolicies && sellerStorePolicy ? (
            <ProductDetailPoliciesSection policy={sellerStorePolicy} theme={theme} />
          ) : null}

          {sellerName ? (
            <ProductMeetSellerSection
              sellerName={sellerName}
              sellerLogoUrl={sellerLogoUrl}
              theme={theme}
              onVisitShop={sellerStoreSlug ? handleVisitShop : undefined}
              onMessageSeller={showSellerMessage ? handleMessageSeller : undefined}
            />
          ) : null}

          <SuggestedProductsSection
            embedded
            title="More from this seller"
            products={sellerProducts}
            onProductPress={handleRecommendationPress}
            showSeller={false}
          />
          <SuggestedProductsSection
            embedded
            title="Recently viewed"
            products={recentlyViewedProducts}
            onProductPress={handleRecommendationPress}
            showSeller={false}
          />
          <SuggestedProductsSection
            embedded
            title="You may also like"
            products={relatedProducts}
            onProductPress={handleRecommendationPress}
          />

        </View>

        </View>

      </ScrollView>

      <ProductDetailBottomDock
        mode={dockMode}
        theme={theme}
        buttonLabel={dockButtonLabel}
        disabled={dockButtonDisabled}
        ctaMode={ctaMode}
        onPress={handleCtaPress}
        errorMessage={dockMode === 'cart' ? cartError : null}
      />

    </View>

    </FadeInContent>

  );

}



const styles = StyleSheet.create({

  screen: {
    flex: 1,
  },
  screenInner: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
  },

  scroll: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
  },

  contentSheet: {
    marginTop: -CONTENT_SHEET_OVERLAP,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  contentAboveInline: {
    gap: spacing.md,
  },
  inlineCtaSection: {
    gap: spacing.sm,
  },
  inlineCtaGhost: {
    opacity: 0,
  },
  inlineCartError: {
    textAlign: 'center',
  },

  centeredState: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    padding: spacing.xl,

    gap: spacing.md,

  },

  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },

  refreshBannerAction: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  retryButton: {
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderForm,
  },

});


