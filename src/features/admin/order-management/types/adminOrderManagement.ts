import type { CartLineItem } from '../../../../services/types/cart';
import type { OrderBillingAddress, OrderDetail, OrderUserInfo } from '../../../../services/types/order';
export type AdminOrderStatusFilter =
  | ''
  | 'Processing'
  | 'Pending'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'OnHold'
  | 'Abandoned'
  | 'Returned';

export interface AdminOrderListItem {
  _id?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  userInfo?: OrderUserInfo;
  cart?: CartLineItem[];
  currency?: string;
  conversionRate?: number | string;
  subTotal?: number | string;
  totalAmount?: number | string;
  totalShippingRate?: number | string;
  serviceFees?: number | string;
  order_price?: number | string;
  billing_address?: OrderBillingAddress;
}

export interface AdminOrderListResponse {
  orders?: AdminOrderListItem[];
  totalOrders?: number;
  totalPages?: number;
}

export interface AdminOrderListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: AdminOrderStatusFilter;
}

export type AdminOrderDetail = OrderDetail & AdminOrderListItem;
