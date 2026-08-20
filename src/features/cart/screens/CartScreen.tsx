import {
  ActivityIndicator,
  FlatList,
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
import { CartLineItemRow } from '../components/CartLineItemRow';
import { useCart } from '../hooks/useCart';
import { formatProductPrice } from '../../products/utils/productDisplay';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'Cart'>;

type CartNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ShoppingStackParamList, 'Cart'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CartScreen({ navigation }: Props) {
  const rootNavigation = useNavigation<CartNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const { entries, subTotal, isLoading, error, removingItemId, retry, removeItem } = useCart(
    user?.userId,
  );

  if (!isAuthenticated || !user?.userId) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.title}>Your cart</Text>
        <Text style={styles.subtitle}>Sign in to view and manage your cart items.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => rootNavigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading cart...</Text>
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
        <Text style={styles.title}>Your cart is empty</Text>
        <Text style={styles.subtitle}>Browse categories and add products to your cart.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.secondaryButtonText}>Browse Categories</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartLineItemRow
            itemId={item.id}
            line={item.line}
            onRemove={(itemId) => void removeItem(itemId)}
            isRemoving={removingItemId === item.id}
          />
        )}
        ListFooterComponent={
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatProductPrice(subTotal)}</Text>
            </View>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.primaryButtonText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        }
      />
    </View>
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
    marginBottom: 4,
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
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 180,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFEDD5',
  },
  secondaryButtonText: {
    color: '#172554',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#172554',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA580C',
  },
});
