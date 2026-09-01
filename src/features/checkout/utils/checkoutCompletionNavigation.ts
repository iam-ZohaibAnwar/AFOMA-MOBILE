import { CommonActions } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

type Nav = NavigationProp<ParamListBase>;

/** Drop cart/payment screens from the stack after a successful checkout. */
export function resetStackAfterCheckoutToHome(navigation: Nav) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    }),
  );
}

export function resetStackAfterCheckoutToOrderDetail(navigation: Nav, orderId: string) {
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: 'MainTabs' }, { name: 'OrderDetail', params: { orderId } }],
    }),
  );
}

export function resetStackAfterCheckoutToOrders(navigation: Nav) {
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: 'MainTabs' }, { name: 'Orders' }],
    }),
  );
}
