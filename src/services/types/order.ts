import type { CartLineItem } from './cart';

/**
 * Order types from customer my-orders flows.
 * TODO: Verify full order document and line item schema.
 */
export interface OrderSummary {
  _id?: string;
  status?: string;
  createdAt?: string;
  totalAmount?: number | string;
  subTotal?: number | string;
  totalShippingRate?: number | string;
  currency?: string;
  /** Present on GET /orders/getOrders/ByUserId/{userId} list responses. */
  cart?: CartLineItem[];
}

export interface CustomerOrdersListResponse {
  orders?: OrderSummary[];
  totalOrders?: number;
  totalPages?: number;
}

export interface OrderUserInfo {
  userId?: string;
  firstName?: string;
  lastName?: string;
  fname?: string;
  lname?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  ZipCode?: string;
  zipcode?: string;
}

export interface OrderBillingAddress {
  name?: {
    given_name?: string;
    surname?: string;
  };
  email_address?: string;
  address?: {
    country_code?: string;
  };
}

export interface OrderDetail extends OrderSummary {
  conversionRate?: number | string;
  serviceFees?: number | string;
  userInfo?: OrderUserInfo;
  billing_address?: OrderBillingAddress;
  shippingMethod?: string;
  shipmentId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

/** Payload traced from web checkout POST /paypal/createorder. */
export interface CreateCheckoutOrderRequest {
  cart: unknown[];
  subTotal: number | string;
  userInfo: Record<string, unknown>;
  totalShippingRate: number | string;
  currency?: string;
  conversionRate?: number | string;
  coupon?: string;
  paymentMethod?: string;
  returnUrl?: string;
  cancelUrl?: string;
  return_url?: string;
  cancel_url?: string;
  client?: string;
  platform?: string;
}

export interface CreateCheckoutOrderResponse {
  success?: boolean;
  message?: string;
  orderId?: string;
  _id?: string;
  Data?: {
    result?: {
      id?: string;
      links?: Array<{
        href?: string;
        rel?: string;
        method?: string;
      }>;
    };
  };
}

/** Payload traced from web checkout POST /paypal/captureorder. */
export interface CaptureCheckoutOrderRequest extends CreateCheckoutOrderRequest {
  orderId: string;
  paymentMethod: 'paypal' | string;
}

export interface CaptureCheckoutOrderResponse {
  success?: boolean;
  message?: string;
  orderId?: string;
  _id?: string;
  paymentId?: string;
  status?: string;
  Data?: Record<string, unknown>;
  payment?: Record<string, unknown>;
}
