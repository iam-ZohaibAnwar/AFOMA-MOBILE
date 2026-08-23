/**
 * Admin order mutation contracts traced from web `/admin/order-management/edit`.
 *
 * Staging QA should confirm these match backend acceptance for:
 * - PUT /orders/update/status/{orderId}
 * - PUT /orders/{orderId}/products/{productId}/shipping
 *
 * Note: list filters may expose `Dispatched` while the web edit mutation dropdown
 * sends `Shipped`. Treat them as distinct until staging confirms equivalence.
 */

/** Values sent by web admin order-status PUT. */
export type AdminOrderStatusMutationValue =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled';

/** Values sent by web admin line-fulfillment PUT. */
export type AdminLineFulfillmentMutationValue =
  | 'Processing'
  | 'Dispatch'
  | 'Returned'
  | 'Cancelled';

export interface AdminSelectOption {
  label: string;
  value: string;
}
