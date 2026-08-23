import type {
  AdminCommissionCartItem,
  AdminCommissionDisplayType,
  AdminCommissionPartyRef,
  AdminCommissionRecipientRoleFilter,
  AdminCommissionRecord,
} from '../types/adminCommission';
import { getRawOrderId } from './adminCommissionRecordMerge';

/** Full web-compatible POST body for /commission/payout-link-kora. */
export type AdminCommissionKorapayPayoutPayload = AdminCommissionRecord & {
  type: AdminCommissionDisplayType;
  totalCommission?: number;
  totalPayout?: number;
  affiliatPayout?: number;
  referralPayout?: number;
  affiliate?: AdminCommissionPartyRef;
  referral?: AdminCommissionPartyRef;
};

function getCartItems(cart: unknown): AdminCommissionCartItem[] {
  if (Array.isArray(cart)) {
    return cart.filter(Boolean) as AdminCommissionCartItem[];
  }

  if (cart && typeof cart === 'object') {
    return Object.values(cart as Record<string, AdminCommissionCartItem>).filter(Boolean);
  }

  return [];
}

/**
 * Web parity: expand raw page records into full synthetic row objects.
 * Used for Korapay initiate POST — distinct from slim AdminCommissionDisplayRow.
 */
export function buildWebSyntheticCommissionRows(
  records: AdminCommissionRecord[],
  roleFilter: AdminCommissionRecipientRoleFilter = '',
): AdminCommissionKorapayPayoutPayload[] {
  const groupedOrdersByOrderId: Record<string, AdminCommissionRecord[]> = {};

  records.forEach((record) => {
    const orderId = getRawOrderId(record);
    if (!orderId) {
      return;
    }

    if (!groupedOrdersByOrderId[orderId]) {
      groupedOrdersByOrderId[orderId] = [];
    }

    groupedOrdersByOrderId[orderId].push(record);
  });

  const finalOrders: AdminCommissionKorapayPayoutPayload[] = [];

  Object.values(groupedOrdersByOrderId).forEach((orderGroup) => {
    const orderMeta = orderGroup.find((record) => getRawOrderId(record)) ?? orderGroup[0];
    const cartItems = getCartItems(
      typeof orderMeta.orderId === 'object' && orderMeta.orderId !== null
        ? orderMeta.orderId.cart
        : undefined,
    );

    const cartBySeller: Record<string, AdminCommissionCartItem[]> = {};
    const sellerDetailsMap: Record<string, AdminCommissionPartyRef | undefined> = {};

    cartItems.forEach((item) => {
      const sellerId = item.productData?.seller?._id;
      if (!sellerId) {
        return;
      }

      if (!cartBySeller[sellerId]) {
        cartBySeller[sellerId] = [];
        sellerDetailsMap[sellerId] = item.productData?.seller;
      }

      cartBySeller[sellerId].push(item);
    });

    if (roleFilter === 'seller' || roleFilter === '') {
      Object.entries(cartBySeller).forEach(([sellerId, sellerCart]) => {
        let totalCommission = 0;
        let totalPayout = 0;
        const sellerCommission = orderGroup.find((record) => record.seller?._id === sellerId);

        if (!sellerCommission) {
          return;
        }

        orderGroup.forEach((record) => {
          if (record.seller?._id === sellerId) {
            totalCommission += Number(record.commissionAmount || 0);
            totalPayout += Number(record.payoutAmount || 0);
          }
        });

        finalOrders.push({
          ...sellerCommission,
          type: 'seller',
          seller: sellerDetailsMap[sellerId] || sellerCommission.seller,
          orderId: {
            ...(typeof sellerCommission.orderId === 'object' && sellerCommission.orderId !== null
              ? sellerCommission.orderId
              : { _id: getRawOrderId(sellerCommission) }),
            cart: sellerCart,
          },
          totalCommission,
          totalPayout,
        });
      });
    }

    if (roleFilter === 'affiliate' || roleFilter === '') {
      const affiliateCommission = orderGroup.find(
        (record) => record.userId?._id && record.affiliateAmount,
      );

      if (affiliateCommission) {
        let totalAffiliateCommission = 0;
        let affiliatPayout = 0;
        let affiliateUser: AdminCommissionPartyRef | undefined;

        orderGroup.forEach((record) => {
          if (record.userId?._id && record.affiliateAmount) {
            affiliateUser = record.userId;
            totalAffiliateCommission += Number(record.commissionAmount || 0);
            affiliatPayout += Number(record.affiliateAmount || 0);
          }
        });

        finalOrders.push({
          ...affiliateCommission,
          type: 'affiliate',
          affiliate: affiliateUser,
          orderId: {
            ...(typeof affiliateCommission.orderId === 'object' && affiliateCommission.orderId !== null
              ? affiliateCommission.orderId
              : { _id: getRawOrderId(affiliateCommission) }),
            cart: [],
          },
          totalCommission: totalAffiliateCommission,
          affiliatPayout,
        });
      }
    }

    if (roleFilter === 'referral' || roleFilter === '') {
      const referralCommission = orderGroup.find(
        (record) => record.userId?._id && record.referralAmount,
      );

      if (referralCommission) {
        let totalReferralCommission = 0;
        let referralPayout = 0;
        let referralUser: AdminCommissionPartyRef | undefined;

        orderGroup.forEach((record) => {
          if (record.userId?._id && record.referralAmount) {
            referralUser = record.userId;
            totalReferralCommission += Number(record.commissionAmount || 0);
            referralPayout += Number(record.referralAmount || 0);
          }
        });

        finalOrders.push({
          ...referralCommission,
          type: 'referral',
          referral: referralUser,
          orderId: {
            ...(typeof referralCommission.orderId === 'object' && referralCommission.orderId !== null
              ? referralCommission.orderId
              : { _id: getRawOrderId(referralCommission) }),
            cart: [],
          },
          totalCommission: totalReferralCommission,
          referralPayout,
        });
      }
    }
  });

  return finalOrders;
}

/** Build the exact POST body web sends for a given commission id on the current page. */
export function buildKorapayPayoutLinkPayload(
  rawPageRecords: AdminCommissionRecord[],
  commissionId: string,
  roleFilter: AdminCommissionRecipientRoleFilter = '',
): AdminCommissionKorapayPayoutPayload | null {
  const syntheticRows = buildWebSyntheticCommissionRows(rawPageRecords, roleFilter);
  return syntheticRows.find((row) => row._id === commissionId) ?? null;
}
