import { addProductToCart } from '../../cart/utils/addProductToCart';
import { getProductById } from '../../../services/api/productsApi';
import { saveAppliedCoupon } from '../../../services/storage/appliedCouponStorage';
import type { UserPricingInfo } from '../../../services/pricing/types';
import type { AppliedCoupon } from '../../../services/types/coupon';
import { applySingleProductPricing } from '../../products/utils/productDisplay';
import {
  buildSelectedVariationsForCart,
  type SelectedAttributes,
} from '../../products/utils/productVariations';
import type { BellNotification, BellNotificationCoupon } from '../types';

function resolveCoupon(notification: BellNotification): AppliedCoupon | null {
  const coupon = notification.couponId;
  if (!coupon || typeof coupon === 'string') {
    return null;
  }

  if (!coupon.couponCode?.trim()) {
    return null;
  }

  return {
    couponCode: coupon.couponCode,
    discountAmount: coupon.discountAmount,
    couponType: coupon.couponType,
    createdBy: coupon.createdBy,
  };
}

function resolveSelectedAttributes(notification: BellNotification): SelectedAttributes {
  const selected = notification.product?.selectedVariation;
  if (!selected || typeof selected !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(selected).filter(([, value]) => typeof value === 'string' && value.trim()),
  ) as SelectedAttributes;
}

export async function addNotificationOfferToCart(
  notification: BellNotification,
  userId: string | undefined,
  userInfo: UserPricingInfo,
): Promise<void> {
  const productId = notification.product?.id;
  if (!productId) {
    throw new Error('This notification does not include a product.');
  }

  const product = applySingleProductPricing(await getProductById(productId), userInfo);
  const selectedAttributes = resolveSelectedAttributes(notification);
  const selectedVariations =
    product.productType === 'Customizable'
      ? buildSelectedVariationsForCart(product.variations, selectedAttributes)
      : [];

  await addProductToCart(userId, product, userInfo, {
    quantity: 1,
    selectedVariations,
  });

  const coupon = resolveCoupon(notification);
  if (coupon && userId) {
    await saveAppliedCoupon(userId, coupon);
  }
}

export function getNotificationOfferLabel(notification: BellNotification): string {
  if (notification.product?.offerDetails?.trim()) {
    return notification.product.offerDetails.trim();
  }

  const coupon = notification.couponId;
  if (coupon && typeof coupon !== 'string' && coupon.couponCode) {
    const couponType = coupon.couponType === 'percentage' ? '%' : '';
    return `Flat ${coupon.discountAmount ?? ''}${couponType} - use code ${coupon.couponCode}`;
  }

  return 'Special offer available';
}

export function getNotificationTitle(notification: BellNotification): string {
  if (notification.product?.name?.trim()) {
    return notification.product.name.trim();
  }

  return 'Special Deal - Applicable on All Products';
}

export function isPopulatedCoupon(
  coupon: BellNotification['couponId'],
): coupon is BellNotificationCoupon {
  return Boolean(coupon && typeof coupon === 'object');
}
