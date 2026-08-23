import type { CartLineItem } from '../../../../services/types/cart';
import type { OrderBillingAddress, OrderUserInfo } from '../../../../services/types/order';

export type SellerOrderStatusFilter =
  | ''
  | 'Processing'
  | 'Pending'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled'
  | 'OnHold'
  | 'Abandoned'
  | 'Returned';

export type SellerLineFulfillmentStatus =
  | 'Processing'
  | 'Dispatch'
  | 'Returned'
  | 'Cancelled';

export interface SellerOrdersListResponse {
  orders?: SellerOrderSummary[];
  totalOrders?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface SellerOrderSummary {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  userInfo?: OrderUserInfo;
  cart?: CartLineItem[];
  currency?: string;
  conversionRate?: number | string;
}

export interface SellerOrderDetail extends SellerOrderSummary {
  filteredCart?: CartLineItem[];
  billing_address?: OrderBillingAddress;
}

export interface GetSellerOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface SellerOrderDetailResponse {
  orders?: SellerOrderDetail;
}
