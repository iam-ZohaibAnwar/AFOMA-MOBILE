import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../auth/hooks/useAuth';
import { CartLineItemRow } from '../../cart/components/CartLineItemRow';
import { useCart } from '../../cart/hooks/useCart';
import { ShippingAddressForm } from '../components/ShippingAddressForm';
import { ShippingOptionsSection } from '../components/ShippingOptionsSection';
import { useCheckoutShippingAddress } from '../hooks/useCheckoutShippingAddress';
import { useCheckoutShippingRates } from '../hooks/useCheckoutShippingRates';
import { usePlaceOrder } from '../hooks/usePlaceOrder';
import { usePayPalCapture } from '../hooks/usePayPalCapture';
import {
  cartHasShippableItems,
} from '../utils/buildCheckoutOrderPayload';
import { validateShippingAddress } from '../utils/validateShippingAddress';
import { formatProductPrice } from '../../products/utils/productDisplay';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Checkout'>;

type CheckoutNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Checkout'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CheckoutScreen(_props: Props) {
  const navigation = useNavigation<CheckoutNavigationProp>();
  const rootNavigation = navigation;
  const { user, isAuthenticated } = useAuth();
  const { cart, entries, subTotal, isLoading, error, retry } = useCart(user?.userId);
  const { shippingAddress, addressErrors, updateField, validateAddress } =
    useCheckoutShippingAddress(user);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const canFetchRates = useMemo(
    () => validateShippingAddress(shippingAddress).isValid,
    [shippingAddress],
  );

  const {
    groups: shippingGroups,
    selectedOptionBySeller,
    selectedOptions,
    selectedShippingCost,
    hasMultipleSellers,
    selectOption,
    isLoading: isShippingLoading,
    error: shippingError,
    retry: retryShipping,
  } = useCheckoutShippingRates(cart, shippingAddress, user, canFetchRates);

  const { isPlacingOrder, orderError, createdOrderId, placeOrder } = usePlaceOrder();
  const { isCapturing, captureError, captureResult, capturePayPalOrder } = usePayPalCapture();

  const shippingAmount = canFetchRates ? selectedShippingCost : 0;
  const total = subTotal + shippingAmount;
  const requiresShippingSelection = cartHasShippableItems(cart);

  const handlePlaceOrderPress = async () => {
    if (!user || isPlacingOrder) {
      return;
    }

    setFormNotice(null);
    const isValid = validateAddress();

    if (!isValid) {
      return;
    }

    if (requiresShippingSelection && selectedOptions.length === 0) {
      setFormNotice('Select a shipping option before placing your order.');
      return;
    }

    if (isShippingLoading) {
      setFormNotice('Please wait for shipping rates to finish loading.');
      return;
    }

    if (shippingError) {
      setFormNotice('Fix shipping rate errors before placing your order.');
      return;
    }

    await placeOrder({
      user,
      cart,
      shippingAddress,
      selectedOptions,
      totals: {
        subTotal,
        shippingTotal: shippingAmount,
        grandTotal: total,
      },
    });
  };

  const handlePayWithPayPalPress = async () => {
    if (!user || !createdOrderId || isCapturing) {
      return;
    }

    await capturePayPalOrder(createdOrderId, {
      user,
      cart,
      shippingAddress,
      selectedOptions,
      totals: {
        subTotal,
        shippingTotal: shippingAmount,
        grandTotal: total,
      },
    });
  };

  if (!isAuthenticated || !user?.userId) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Sign in to continue to checkout.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => rootNavigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading checkout...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.primaryButton} onPress={() => void retry()}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.title}>Nothing to checkout</Text>
        <Text style={styles.subtitle}>Your cart is empty. Add items before checkout.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => rootNavigation.navigate('Shopping', { screen: 'Cart' })}
        >
          <Text style={styles.primaryButtonText}>Back to Cart</Text>
        </Pressable>
      </View>
    );
  }

  if (createdOrderId) {
    if (captureResult) {
      return (
        <View style={styles.centeredState}>
          <Text style={styles.paymentSuccessTitle}>Payment successful</Text>
          <Text style={styles.subtitle}>
            Your PayPal payment was captured successfully.
          </Text>
          <View style={styles.successBox}>
            {captureResult.details.map((detail) => (
              <View key={detail.label} style={styles.successDetailRow}>
                <Text style={styles.successLabel}>{detail.label}</Text>
                <Text style={styles.successValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.centeredState}>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.subtitle}>
          Your order was created. Complete payment with PayPal to finish checkout.
        </Text>
        <View style={styles.successBox}>
          <Text style={styles.successLabel}>Order ID</Text>
          <Text style={styles.successValue}>{createdOrderId}</Text>
        </View>

        {captureError ? (
          <View style={[styles.noticeBox, styles.noticeError, styles.successNotice]}>
            <Text style={[styles.noticeText, styles.noticeTextError]}>{captureError}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.payPalButton, isCapturing && styles.payPalButtonDisabled]}
          disabled={isCapturing}
          onPress={() => void handlePayWithPayPalPress()}
        >
          {isCapturing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payPalButtonText}>Pay with PayPal</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <CartLineItemRow itemId={item.id} line={item.line} showRemove={false} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <ShippingAddressForm
                value={shippingAddress}
                errors={addressErrors}
                onChange={updateField}
              />
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Shipping Method</Text>
              <ShippingOptionsSection
                groups={shippingGroups}
                selectedOptionBySeller={selectedOptionBySeller}
                onSelectOption={selectOption}
                isLoading={isShippingLoading}
                error={shippingError}
                onRetry={() => void retryShipping()}
                canFetchRates={canFetchRates}
                hasMultipleSellers={hasMultipleSellers}
              />
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatProductPrice(subTotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>{formatProductPrice(shippingAmount)}</Text>
              </View>
              {selectedOptions.length === 1 ? (
                <Text style={styles.selectedShippingText}>{selectedOptions[0].label}</Text>
              ) : null}
              {selectedOptions.length > 1 ? (
                <Text style={styles.selectedShippingText}>
                  {selectedOptions.length} shipping options selected
                </Text>
              ) : null}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatProductPrice(total)}</Text>
              </View>
            </View>

            {formNotice ? (
              <View style={[styles.noticeBox, styles.noticeInfo]}>
                <Text style={[styles.noticeText, styles.noticeTextInfo]}>{formNotice}</Text>
              </View>
            ) : null}

            {orderError ? (
              <View style={[styles.noticeBox, styles.noticeError]}>
                <Text style={[styles.noticeText, styles.noticeTextError]}>{orderError}</Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.placeOrderButton,
                (isPlacingOrder || isShippingLoading) && styles.placeOrderButtonDisabled,
              ]}
              disabled={isPlacingOrder || isShippingLoading}
              onPress={() => void handlePlaceOrderPress()}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              )}
            </Pressable>
            <Text style={styles.disabledNote}>Payment is completed on the next screen.</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  footer: {
    gap: 16,
    marginTop: 8,
  },
  sectionBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  summaryBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172554',
  },
  selectedShippingText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172554',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA580C',
  },
  noticeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noticeInfo: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  noticeError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeTextInfo: {
    color: '#92400E',
  },
  noticeTextError: {
    color: '#B91C1C',
  },
  placeOrderButton: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledNote: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  successBox: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
  },
  successDetailRow: {
    gap: 4,
  },
  successNotice: {
    width: '100%',
    maxWidth: 360,
  },
  paymentSuccessTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
  },
  payPalButton: {
    backgroundColor: '#003087',
    borderRadius: 10,
    minHeight: 50,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  payPalButtonDisabled: {
    opacity: 0.6,
  },
  payPalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 180,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  successLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    textTransform: 'uppercase',
  },
  successValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF7ED',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172554',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  stateText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
