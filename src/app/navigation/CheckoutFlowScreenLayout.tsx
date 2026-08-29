import { StyleSheet, View, type ReactNode } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { colors } from '../../design-system';
import { useCart } from '../../features/cart/hooks/useCart';
import { getCartItemCount } from '../../features/cart/utils/cartUtils';
import { MarketplaceFooterNav } from './MarketplaceFooterNav';

interface CheckoutFlowScreenLayoutProps {
  children: ReactNode;
}

export function CheckoutFlowScreenLayout({ children }: CheckoutFlowScreenLayoutProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { cart } = useCart();
  const cartCount = getCartItemCount(cart);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{children}</View>
      <MarketplaceFooterNav
        activeRouteName="CartTab"
        navigation={navigation}
        cartCount={cartCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
