import { createContext, useContext, type ReactNode } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { useAuthContext } from '../../auth/context/AuthProvider';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useCartState, type CartState } from '../hooks/useCartState';

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const authUserId = resolveAuthUserId(user);
  const { userInfo } = usePricing();
  const value = useCartState(authUserId, userInfo);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
