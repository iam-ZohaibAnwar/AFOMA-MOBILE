import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { cancelOrderShipment } from '../../../services/api/ordersApi';

export function useCancelOrder(orderId: string, onSuccess?: () => void) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelOrder = useCallback(async () => {
    if (!orderId) {
      setCancelError('Order ID is missing.');
      return false;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelOrderShipment(orderId);
      onSuccess?.();
      return true;
    } catch (err) {
      setCancelError(getErrorMessage(err, 'Failed to cancel order'));
      return false;
    } finally {
      setIsCancelling(false);
    }
  }, [onSuccess, orderId]);

  const clearCancelError = useCallback(() => {
    setCancelError(null);
  }, []);

  return {
    cancelOrder,
    isCancelling,
    cancelError,
    clearCancelError,
  };
}
