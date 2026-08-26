import { useLayoutEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInContent } from '../../../components/motion';
import { usePricing } from '../../../app/providers/PricingProvider';

import { AppText } from '../../../components/ui/AppText';

import { colors, spacing } from '../../../design-system';

import { usePdpTheme } from '../../../design-system/pdpTheme';

import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { navigateToCartTab, navigateToShop } from '../../../app/navigation/shoppingNavigation';

import {

  AddToCartValidationError,

  addProductToCart,

} from '../../cart/utils/addProductToCart';

import { buildAddToCartInputFromPdp } from '../../cart/utils/cartLineMerge';

import { getErrorMessage } from '../../../services/api/errors';

import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Product } from '../../../services/types/product';

import { ProductAccordion } from '../components/ProductAccordion';
import { ProductDetailDescriptionContent } from '../components/ProductDetailDescriptionContent';
import { ProductDetailPolicyContent } from '../components/ProductDetailPolicyContent';
import { ProductDetailReviewsContent } from '../components/ProductDetailReviewsContent';
import { ProductDetailReviewsHeaderMeta } from '../components/ProductDetailReviewsHeaderMeta';

import { ProductDetailHeader } from '../components/ProductDetailHeader';

import { ProductDetailNavBar } from '../components/ProductDetailNavBar';

import { ProductDetailStickyBar, getProductDetailStickyBarInset } from '../components/ProductDetailStickyBar';

import { ProductGallery } from '../components/ProductGallery';

import { ProductSellerSection } from '../components/ProductSellerSection';

import { ProductTypeInfo } from '../components/ProductTypeInfo';

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

  getProductCompareAtPriceForSelection,

  getProductDescription,

  getProductDiscountPercent,

  getProductDisplayName,

  getProductPriceForSelection,

  getProductRouteId,

  getSellerDisplayName,
  getSellerStorePolicy,
  hasSellerStorePolicy,
} from '../utils/productDisplay';



type Props = NativeStackScreenProps<ShoppingStackParamList, 'ProductDetail'>;



type FeedbackType = 'success' | 'error';



const CONTENT_SHEET_GAP = spacing.lg;
const CONTENT_SHEET_RADIUS = 28;



export function ProductDetailScreen({ route, navigation }: Props) {

  const { productId, slug } = route.params;
  const insets = useSafeAreaInsets();
  const stickyBarInset = getProductDetailStickyBarInset(insets.bottom);

  const theme = usePdpTheme();

  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);

  const { userInfo } = usePricing();



  const { product, isRefreshing, error, retry } = useProductDetail(productId, slug);

  const { sellerProducts, relatedProducts, recentlyViewedProducts } =
    useProductDetailRecommendations(product);

  const variationState = useProductDetailVariations(product);

  const productRouteId = product ? getProductRouteId(product) : undefined;

  const { averageRating, reviewCount, reviews, isLoading: isReviewsLoading } = useProductReviews(productRouteId);



  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);



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
  const productDescription = product ? getProductDescription(product) : '';

  const sellerName = product ? getSellerDisplayName(product) : undefined;
  const sellerStoreSlug = product?.seller?.storeSlug?.trim();
  const sellerLogoUrl = product?.seller?.storeLogo || product?.seller?.userProfile;
  const sellerStorePolicy = product ? getSellerStorePolicy(product) : undefined;
  const showSellerPolicies = hasSellerStorePolicy(sellerStorePolicy);

  const accordionSections = useMemo(() => {
    const sections: Array<{
      key: string;
      title: string;
      content: ReactNode;
      renderHeaderMeta?: (expanded: boolean) => ReactNode | null;
    }> = [];

    if (sellerName) {
      sections.push({
        key: 'shop',
        title: 'Shop',
        content: (
          <ProductSellerSection
            embedded
            sellerName={sellerName}
            sellerLogoUrl={sellerLogoUrl}
            onPress={
              sellerStoreSlug ? () => navigateToShop(navigation, sellerStoreSlug) : undefined
            }
          />
        ),
      });
    }

    sections.push({
      key: 'product-details',
      title: 'Product Details',
      content: (
        <ProductDetailDescriptionContent description={productDescription} theme={theme} />
      ),
    });

    sections.push({
      key: 'reviews',
      title: 'Customer Reviews',
      renderHeaderMeta: (expanded) =>
        expanded ? (
          <ProductDetailReviewsHeaderMeta
            averageRating={averageRating}
            reviewCount={reviewCount}
            theme={theme}
          />
        ) : null,
      content: (
        <ProductDetailReviewsContent
          reviews={reviews}
          reviewCount={reviewCount}
          isLoading={isReviewsLoading}
          theme={theme}
        />
      ),
    });

    if (showSellerPolicies && sellerStorePolicy) {
      sections.push({
        key: 'cancel-policies',
        title: 'Cancel Policies',
        content: <ProductDetailPolicyContent policy={sellerStorePolicy} theme={theme} />,
      });
    }

    return sections;
  }, [
    averageRating,
    isReviewsLoading,
    navigation,
    productDescription,
    reviewCount,
    reviews,
    sellerLogoUrl,
    sellerName,
    sellerStorePolicy,
    sellerStoreSlug,
    showSellerPolicies,
    theme,
  ]);



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

        setFeedback({

          type: 'error',

          message: 'Select all product options before adding to cart.',

        });

      } else if (variationState.outOfStock) {

        setFeedback({

          type: 'error',

          message: 'This product is out of stock.',

        });

      }

      return;

    }



    if (variationState.maxQuantity < 1) {

      setFeedback({

        type: 'error',

        message: 'This product is out of stock.',

      });

      return;

    }



    if (variationState.quantity > variationState.maxQuantity) {

      setFeedback({

        type: 'error',

        message: `Maximum available quantity is ${variationState.maxQuantity}.`,

      });

      return;

    }



    setIsAddingToCart(true);

    setFeedback(null);



    try {

      const cartInput = buildAddToCartInputFromPdp({

        product,

        userInfo,

        quantity: variationState.quantity,

        selectedAttributes: variationState.selectedAttributes,

        cartKey: variationState.cartKey,

      });



      const result = await addProductToCart(authUserId, product, userInfo, {

        quantity: cartInput.quantity,

        cartKey: cartInput.cartKey,

        selectedVariations: cartInput.selectedVariations,

        maxQuantity: cartInput.maxQuantity,

        mergeMode: 'increment',

      });



      setFeedback({

        type: 'success',

        message: `Added ${result.quantityAdded} item${result.quantityAdded === 1 ? '' : 's'} to cart (${result.totalQuantity} total).`,

      });

    } catch (err) {

      setFeedback({

        type: 'error',

        message:

          err instanceof AddToCartValidationError

            ? err.message

            : getErrorMessage(err, 'Failed to add item to cart.'),

      });

    } finally {

      setIsAddingToCart(false);

    }

  };



  if (error && !product && !isRefreshing) {

    return (

      <View style={[styles.centeredState, { backgroundColor: theme.background }]}>

        <ProductDetailNavBar onBackPress={() => navigation.goBack()} />

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



  const addButtonDisabled =

    !product || !variationState.canAddToCart || isAddingToCart || variationState.disabledBySeller;



  const addButtonLabel = variationState.disabledBySeller

    ? 'Unavailable'

    : variationState.selectionIncomplete

      ? 'Select options'

      : variationState.outOfStock

        ? 'Out of stock'

        : 'Add to Cart';



  const quantityDisabled =

    addButtonDisabled || !variationState.showQuantityStepper || variationState.isDownloadable;



  return (

    <FadeInContent style={styles.screen}>

    <View style={[styles.screenInner, { backgroundColor: theme.background }]}>

      <ProductDetailNavBar
        onBackPress={() => navigation.goBack()}
        onSharePress={product ? handleSharePress : undefined}
      />

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
      >

        <ProductGallery

          images={galleryImages}

          productName={product ? getProductDisplayName(product) : ''}

          theme={theme}

        />



        <View
          style={[
            styles.contentSheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: stickyBarInset + spacing.md,
            },
          ]}
        >

          <ProductDetailHeader

            productName={product ? getProductDisplayName(product) : ''}

            unitPrice={selectedPrice}

            compareAtPrice={compareAtPrice}

            discountPercent={discountPercent}

            averageRating={averageRating}

            reviewCount={reviewCount}

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



          {product ? <ProductTypeInfo product={product} /> : null}

          {accordionSections.map((section) => (
            <ProductAccordion
              key={section.key}
              title={section.title}
              theme={theme}
              renderHeaderMeta={section.renderHeaderMeta}
            >
              {section.content}
            </ProductAccordion>
          ))}

          <SuggestedProductsSection
            embedded
            title="More From This Seller"
            products={sellerProducts}
            onProductPress={handleRecommendationPress}
          />
          <SuggestedProductsSection
            embedded
            title="You May Also Like"
            products={relatedProducts}
            onProductPress={handleRecommendationPress}
          />
          <SuggestedProductsSection
            embedded
            title="Recently Viewed"
            products={recentlyViewedProducts}
            onProductPress={handleRecommendationPress}
          />

        </View>

      </ScrollView>



      {feedback ? (

        <View

          style={[

            styles.feedbackToast,

            {

              backgroundColor:

                feedback.type === 'success' ? theme.deliveryBannerBg : theme.surfaceMuted,

              borderColor: theme.border,

            },

          ]}

        >

          <AppText

            variant="bodySmall"

            style={{

              color: feedback.type === 'success' ? theme.deliveryBannerText : theme.textPrimary,

            }}

          >

            {feedback.message}

          </AppText>

          {feedback.type === 'success' ? (

            <Pressable onPress={() => navigateToCartTab(navigation)}>

              <AppText variant="bodyMedium" color="textPrimary">

                View cart

              </AppText>

            </Pressable>

          ) : null}

        </View>

      ) : null}



      <ProductDetailStickyBar

        theme={theme}

        buttonLabel={addButtonLabel}

        disabled={addButtonDisabled}

        isLoading={isAddingToCart}

        onAddToCart={() => void handleAddToCart()}

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

  scroll: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
  },

  contentSheet: {
    marginTop: CONTENT_SHEET_GAP,
    borderTopLeftRadius: CONTENT_SHEET_RADIUS,
    borderTopRightRadius: CONTENT_SHEET_RADIUS,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },

  feedbackToast: {

    marginHorizontal: spacing.lg,

    marginBottom: spacing.sm,

    borderRadius: 12,

    padding: spacing.md,

    borderWidth: 1,

    gap: spacing.sm,

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


