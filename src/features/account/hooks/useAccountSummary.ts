import { useOrders } from '../../orders/hooks/useOrders';

export function useAccountSummary(userId?: string) {
  const { totalOrders, isLoading, error, retry } = useOrders(userId);

  return {
    summary: {
      orderCount: totalOrders,
      wishlistCount: 0,
      addressCount: 0,
    },
    isLoading,
    error,
    retry,
  };
}
