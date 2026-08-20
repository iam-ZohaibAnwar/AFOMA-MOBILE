import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../auth/hooks/useAuth';
import { addProductToCart } from '../../cart/utils/addProductToCart';
import { useProductDetail } from '../hooks/useProductDetail';
import {
  formatProductPrice,
  getProductDescription,
  getProductDisplayName,
  getProductImageUrl,
  getProductPrice,
  getSellerDisplayName,
  isProductOutOfStock,
} from '../utils/productDisplay';
import { getErrorMessage } from '../../../services/api/errors';
import type { RootStackParamList, ShoppingStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ProductDetail'>;

type FeedbackType = 'success' | 'error';

export function ProductDetailScreen({ route, navigation }: Props) {
  const { productId, slug } = route.params;
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const { product, isLoading, error, retry } = useProductDetail(productId, slug);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: product ? getProductDisplayName(product) : 'Product Detail',
    });
  }, [navigation, product]);

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated || !user?.userId) {
      setFeedback({
        type: 'error',
        message: 'Please sign in to add items to your cart.',
      });
      return;
    }

    if (isProductOutOfStock(product)) {
      setFeedback({
        type: 'error',
        message: 'This product is out of stock.',
      });
      return;
    }

    setIsAddingToCart(true);
    setFeedback(null);

    try {
      await addProductToCart(user.userId, product);
      setFeedback({
        type: 'success',
        message: 'Item added to cart.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(err, 'Failed to add item to cart.'),
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={styles.stateText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.errorText}>{error ?? 'Product not found.'}</Text>
        <Pressable style={styles.retryButton} onPress={() => void retry()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl = getProductImageUrl(product);
  const sellerName = getSellerDisplayName(product);
  const outOfStock = isProductOutOfStock(product);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageWrap}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No image</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{getProductDisplayName(product)}</Text>
        <Text style={styles.price}>{formatProductPrice(getProductPrice(product))}</Text>

        {sellerName ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text style={styles.sectionBody}>{sellerName}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionBody}>{getProductDescription(product)}</Text>
        </View>

        {feedback ? (
          <View
            style={[
              styles.feedbackBox,
              feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
              ]}
            >
              {feedback.message}
            </Text>
            {feedback.type === 'error' && feedback.message.includes('sign in') ? (
              <Pressable
                style={styles.signInLink}
                onPress={() => rootNavigation.navigate('Auth', { screen: 'Login' })}
              >
                <Text style={styles.signInLinkText}>Sign in</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <Pressable
          style={[
            styles.addButton,
            (outOfStock || isAddingToCart) && styles.addButtonDisabled,
          ]}
          disabled={outOfStock || isAddingToCart}
          onPress={() => void handleAddToCart()}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>
              {outOfStock ? 'Out of stock' : 'Add to Cart'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF7ED',
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
  retryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 4,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFEDD5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#172554',
    lineHeight: 30,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EA580C',
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172554',
  },
  sectionBody: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  feedbackBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackTextSuccess: {
    color: '#047857',
  },
  feedbackTextError: {
    color: '#B91C1C',
  },
  signInLink: {
    alignSelf: 'flex-start',
  },
  signInLinkText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
