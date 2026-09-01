import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { usePricing } from '../../../app/providers/PricingProvider';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { colors, spacing } from '../../../design-system';
import { motion } from '../../../design-system/motion';
import { useAuth } from '../../auth/hooks/useAuth';
import { authReturnTo, openAuthLogin } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { getProductRouteId } from '../../products/utils/productDisplay';
import type { SelectedAttributes } from '../../products/utils/productVariations';
import {
  navigateToBrowseTab,
  navigateToHomeTab,
} from '../../../app/navigation/shoppingNavigation';
import type { MainTabParamList, RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { CheckoutStepIndicator } from '../../checkout/components/CheckoutStepIndicator';
import { CartGuestAddressModal } from '../components/CartGuestAddressModal';
import { DeliveryAddressSheet } from '../../checkout/components/DeliveryAddressSheet';
import { ShippingOptionsSheet } from '../components/ShippingOptionsSheet';
import { CartLineItemRow } from '../components/CartLineItemRow';
import { CartRecommendationsSection } from '../components/CartRecommendationsSection';
import { CartScreenHeader } from '../components/CartScreenHeader';
import { CartShippingDetailsCard } from '../components/CartShippingDetailsCard';
import { CartOrderSummaryCard } from '../components/CartOrderSummaryCard';
import { CartSummarySheet } from '../components/CartSummarySheet';
import { CartVariationSheet, buildCartVariationSelections } from '../components/CartVariationSheet';
import { useCart } from '../hooks/useCart';
import { useCartShipping } from '../hooks/useCartShipping';
import { useCartCoupon } from '../hooks/useCartCoupon';
import { useCartRecommendations } from '../hooks/useCartRecommendations';
import {
  getCartLineDisplayAmount,
  getCartSubtotalCad,
  getSelectedCartDisplaySubtotal,
} from '../utils/cartPricing';
import { calculateCartTotals } from '../utils/cartTotals';
import {
  isCartShippingPending,
  resolveCartShippingCad,
} from '../utils/resolveCartShipping';
import {
  emptyShippingAddress,
  type ShippingAddressField,
} from '../../checkout/types/shippingAddress';
import {
  updateShippingAddressField,
  validateShippingAddress,
} from '../../checkout/utils/validateShippingAddress';

type Props = BottomTabScreenProps<MainTabParamList, 'CartTab'>;

type CartNavigationProp = CompositeNavigationProp<
  BottomTabScreenProps<MainTabParamList, 'CartTab'>['navigation'],
  CompositeNavigationProp<
    NativeStackNavigationProp<ShoppingStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

function CartItemSpacer() {
  return <View style={styles.itemSpacer} />;
}

export function CartScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler({ hideFooterOnScroll: false });
  const rootNavigation = useNavigation<CartNavigationProp>();
  const pendingHighlightId = route.params?.highlightItemId;
  const [emphasizedItemId, setEmphasizedItemId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const { user, isAuthenticated } = useAuth();
  const authUserId = resolveAuthUserId(user);
  const { userInfo } = usePricing();
  const currency = userInfo.currency ?? 'CAD';
  const currencyRate = userInfo.currencyRate ?? 1;

  const {
    cart,
    entries,
    subTotal,
    totalShippingRate,
    fetchedShippingRate,
    isLoading,
    error,
    removingItemId,
    updatingItemId,
    retry,
    removeItem,
    updateQuantity,
    updateVariations,
    replaceCart,
    setShippingTotals,
  } = useCart();

  const [modalAddress, setModalAddress] = useState(emptyShippingAddress());
  const [modalErrors, setModalErrors] = useState<Partial<Record<ShippingAddressField, string>>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [variationItemId, setVariationItemId] = useState<string | null>(null);
  const [variationError, setVariationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedItemIds(new Set(entries.map((entry) => entry.id)));
  }, [entries]);

  const filteredSelectedCart = useMemo(() => {
    const next: typeof cart = {};
    for (const itemId of selectedItemIds) {
      if (cart[itemId]) {
        next[itemId] = cart[itemId];
      }
    }
    return next;
  }, [cart, selectedItemIds]);

  const cartShipping = useCartShipping({
    cart,
    checkoutCart: filteredSelectedCart,
    user,
    authUserId,
    replaceCart,
    setShippingTotals,
  });

  useEffect(() => {
    if (!pendingHighlightId) {
      return;
    }

    setEmphasizedItemId(pendingHighlightId);
    navigation.setParams({ highlightItemId: undefined });
  }, [navigation, pendingHighlightId]);

  useEffect(() => {
    if (!emphasizedItemId || entries.length === 0) {
      return;
    }

    const index = entries.findIndex((entry) => entry.id === emphasizedItemId);
    if (index < 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.2,
      });
    });

    const clearTimer = setTimeout(() => {
      setEmphasizedItemId(null);
    }, motion.majorTransitionMs + motion.screenEnterMs + motion.contentFadeMs + 120);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(clearTimer);
    };
  }, [emphasizedItemId, entries]);

  useEffect(() => {
    if (cartShipping.addressModalVisible) {
      setModalAddress(cartShipping.shippingAddress);
      setModalErrors({});
    }
  }, [cartShipping.addressModalVisible, cartShipping.shippingAddress]);

  const shippingRates = useMemo(
    () => ({
      totalShippingRate,
      fetchedShippingRate,
    }),
    [fetchedShippingRate, totalShippingRate],
  );

  const {
    appliedCoupon,
    discountAmount,
    isApplying: isApplyingCoupon,
    couponMessage,
    couponError,
    applyPromoCode,
    clearCoupon,
  } = useCartCoupon(authUserId, user?.email, cart, shippingRates, replaceCart);

  const cartProductIds = useMemo(
    () =>
      entries
        .map(({ line }) => getProductRouteId(line.productData ?? {}))
        .filter((id): id is string => Boolean(id)),
    [entries],
  );

  const { products: recommendations, isLoading: isRecommendationsLoading } =
    useCartRecommendations(cartProductIds);

  const selectedEntries = useMemo(
    () => entries.filter((entry) => selectedItemIds.has(entry.id)),
    [entries, selectedItemIds],
  );

  const selectedSubTotalCad = useMemo(
    () => getCartSubtotalCad(filteredSelectedCart, userInfo),
    [filteredSelectedCart, userInfo],
  );

  const displaySubTotal = useMemo(
    () => getSelectedCartDisplaySubtotal(cart, selectedItemIds, userInfo),
    [cart, selectedItemIds, userInfo],
  );

  const shippingCad = useMemo(
    () =>
      resolveCartShippingCad(
        filteredSelectedCart,
        totalShippingRate,
        fetchedShippingRate,
        cartShipping.selectedOptions,
        currencyRate,
      ),
    [
      currencyRate,
      filteredSelectedCart,
      cartShipping.selectedOptions,
      fetchedShippingRate,
      totalShippingRate,
    ],
  );
  const shippingPending =
    selectedItemIds.size === 0 ||
    cartShipping.shippingContext.needsDeliveryDetails ||
    isCartShippingPending(
      filteredSelectedCart,
      cartShipping.selectedOptions,
      cartShipping.groups,
    ) ||
    (cartShipping.isLoading && cartShipping.groups.length === 0);

  const totals = useMemo(
    () =>
      calculateCartTotals({
        subtotalCad: selectedSubTotalCad,
        shippingCad,
        discountDisplay: discountAmount,
        currencyRate,
        shippingPending,
      }),
    [currencyRate, discountAmount, selectedSubTotalCad, shippingCad, shippingPending],
  );

  const selectedItemCount = selectedEntries.length;
  const editingVariationLine = variationItemId ? cart[variationItemId] ?? null : null;

  const handleBackFromCart = () => {
    if (rootNavigation.canGoBack()) {
      rootNavigation.goBack();
    } else {
      navigateToHomeTab(rootNavigation);
    }
  };

  const handleSaveVariations = async (selectedAttributes: SelectedAttributes) => {
    if (!variationItemId || !editingVariationLine?.productData) {
      return;
    }

    setVariationError(null);

    try {
      const selectedVariations = buildCartVariationSelections(
        editingVariationLine.productData,
        selectedAttributes,
      );
      const nextCartKey = await updateVariations(variationItemId, selectedVariations);
      if (nextCartKey && nextCartKey !== variationItemId) {
        setSelectedItemIds((current) => {
          if (!current.has(variationItemId)) {
            return current;
          }

          const next = new Set(current);
          next.delete(variationItemId);
          next.add(nextCartKey);
          return next;
        });
        setEmphasizedItemId(nextCartKey);
      }
      setVariationItemId(null);
    } catch (err) {
      setVariationError(err instanceof Error ? err.message : 'Failed to update options.');
    }
  };

  const handleSubmitDeliveryDetails = () => {
    const validation = validateShippingAddress(modalAddress);
    if (!validation.isValid) {
      setModalErrors(validation.errors);
      return;
    }

    void cartShipping.submitDeliveryDetails(modalAddress).catch(() => {
      // Error surfaced via cartShipping.addressError in modal.
    });
  };

  const handleModalAddressChange = (field: ShippingAddressField, value: string) => {
    setModalAddress((current) => updateShippingAddressField(current, field, value));
    setModalErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        if (next.size === 1) {
          return current;
        }
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  if (error && entries.length === 0 && !isLoading) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <AppText variant="bodySmall" color="error">
          {error}
        </AppText>
        <AppButton label="Try again" onPress={() => void retry()} />
      </View>
    );
  }

  if (isLoading && entries.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <CartScreenHeader onBack={handleBackFromCart} />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={[styles.centeredState, { paddingTop: insets.top }]}>
        <AppText variant="h2">Your cart is empty</AppText>
        <AppText variant="body" style={styles.centeredCopy}>
          Browse categories and add products to your cart.
        </AppText>
        <AppButton label="Continue shopping" onPress={() => navigateToHomeTab(rootNavigation)} fullWidth />
        <AppButton
          label="Browse categories"
          variant="outline"
          onPress={() => navigateToBrowseTab(rootNavigation)}
          fullWidth
        />
      </View>
    );
  }

  const showCheckoutAuthGate =
    !isAuthenticated && !cartShipping.shippingContext.hasCheckoutIdentity;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CartScreenHeader onBack={handleBackFromCart} itemCount={selectedItemCount} />

      <View style={styles.stepsWrap}>
        <CheckoutStepIndicator currentStep="cart" />
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={onMarketplaceScroll}
        {...marketplaceScrollProps}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        ItemSeparatorComponent={CartItemSpacer}
        renderItem={({ item }) => (
          <CartLineItemRow
            itemId={item.id}
            line={item.line}
            currency={currency}
            displayLineTotal={getCartLineDisplayAmount(item.line, cart, userInfo)}
            selected={selectedItemIds.has(item.id)}
            emphasized={item.id === emphasizedItemId}
            onToggleSelect={toggleItemSelection}
            onRemove={(itemId) => void removeItem(itemId)}
            onQuantityChange={(itemId, nextQuantity) => void updateQuantity(itemId, nextQuantity)}
            onEditVariations={(itemId) => {
              setVariationError(null);
              setVariationItemId(itemId);
            }}
            isRemoving={removingItemId === item.id}
            isUpdating={updatingItemId === item.id}
            showRemove
          />
        )}
        ListFooterComponent={
          <View style={styles.footerContent}>
            <CartShippingDetailsCard
              isAuthenticated={isAuthenticated}
              isLoadingAuthAddress={cartShipping.isLoadingAuthAddress}
              needsDeliveryDetails={cartShipping.shippingContext.needsDeliveryDetails}
              canFetchRates={cartShipping.shippingContext.canFetchRates}
              isLoading={cartShipping.isLoading}
              error={cartShipping.error}
              shippingAddress={cartShipping.shippingAddress}
              groups={cartShipping.groups}
              selectedOptions={cartShipping.selectedOptions}
              currency={currency}
              onOpenDeliveryDetails={cartShipping.openDeliveryDetails}
              onOpenShippingOptions={cartShipping.openShippingOptions}
              onRetry={() => void cartShipping.retry()}
            />

            <CartOrderSummaryCard
              currency={currency}
              itemCount={selectedItemCount}
              subTotal={displaySubTotal}
              discountAmount={totals.displayDiscount}
              shippingAmount={totals.displayShipping}
              serviceChargeAmount={totals.displayServiceCharge}
              total={totals.displayTotal}
              shippingPending={shippingPending}
              onApplyPromo={applyPromoCode}
              onRemovePromo={clearCoupon}
              isApplyingCoupon={isApplyingCoupon}
              appliedCode={appliedCoupon?.couponCode}
              couponError={couponError}
              couponMessage={couponMessage}
            />

            <CartRecommendationsSection
              products={recommendations}
              isLoading={isRecommendationsLoading}
              currency={currency}
              onProductPress={(product) =>
                rootNavigation.navigate('ProductDetail', {
                  productId: getProductRouteId(product),
                  slug: product.slug,
                })
              }
            />
          </View>
        }
      />

      <CartSummarySheet
        currency={currency}
        total={totals.displayTotal}
        shippingPending={shippingPending}
        checkoutDisabled={!cartShipping.canProceedToCheckout || selectedItemCount === 0}
        showAuthGate={showCheckoutAuthGate}
        onSignIn={() => openAuthLogin(rootNavigation, authReturnTo.cartTab())}
        onContinueAsGuest={cartShipping.openDeliveryDetails}
        hasFooterTabs
        onCheckout={() => {
          rootNavigation.navigate('Payment');
        }}
      />

      <DeliveryAddressSheet
        visible={cartShipping.deliveryAddressSheetVisible}
        user={user}
        userId={authUserId}
        onClose={() => cartShipping.setDeliveryAddressSheetVisible(false)}
        onSelectAddress={(address) => cartShipping.selectSavedAddress(address)}
      />

      <ShippingOptionsSheet
        visible={cartShipping.shippingOptionsSheetVisible}
        groups={cartShipping.groups}
        selectedOptionBySeller={cartShipping.selectedOptionBySeller}
        hasMultipleSellers={cartShipping.hasMultipleSellers}
        isLoading={cartShipping.isLoading}
        error={cartShipping.error}
        onClose={() => cartShipping.setShippingOptionsSheetVisible(false)}
        onRetry={() => void cartShipping.retry()}
        onConfirm={cartShipping.confirmShippingOptions}
      />

      <CartGuestAddressModal
        visible={cartShipping.addressModalVisible}
        value={modalAddress}
        errors={modalErrors}
        isSubmitting={cartShipping.isSavingAddress}
        errorMessage={cartShipping.addressError}
        onChange={handleModalAddressChange}
        onSubmit={handleSubmitDeliveryDetails}
        onClose={() => cartShipping.setAddressModalVisible(false)}
      />

      <CartVariationSheet
        visible={variationItemId !== null}
        itemId={variationItemId}
        line={editingVariationLine}
        isSaving={Boolean(variationItemId && updatingItemId === variationItemId)}
        errorMessage={variationError}
        onClose={() => {
          setVariationItemId(null);
          setVariationError(null);
        }}
        onSave={(selectedAttributes) => {
          void handleSaveVariations(selectedAttributes);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepsWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  itemSpacer: {
    height: spacing.md,
  },
  footerContent: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  centeredState: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  centeredCopy: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
