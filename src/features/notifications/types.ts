import type { AppliedCoupon } from '../../services/types/coupon';

export interface BellNotificationProduct {
  id?: string;
  name?: string;
  sku?: string;
  image?: string;
  offerDetails?: string;
  selectedVariation?: Record<string, string>;
}

export interface BellNotificationCoupon extends AppliedCoupon {
  _id?: string;
  couponCode?: string;
  discountAmount?: number;
  couponType?: 'percentage' | 'fixed' | string;
  expirationDate?: string;
}

export interface BellNotification {
  _id: string;
  userId?: string;
  product?: BellNotificationProduct;
  couponId?: BellNotificationCoupon | string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
