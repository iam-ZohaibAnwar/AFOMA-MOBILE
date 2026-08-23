import type {
  AdminCommissionCartItem,
  AdminCommissionDisplayRow,
  AdminCommissionPartyRef,
  AdminCommissionRecipientRoleFilter,
  AdminCommissionRecord,
} from '../types/adminCommission';
import { formatAdminCommissionOrderDisplayId } from './adminCommissionFormatters';
import { getRawOrderId } from './adminCommissionRecordMerge';

function getCartItems(cart: unknown): AdminCommissionCartItem[] {
  if (Array.isArray(cart)) {
    return cart.filter(Boolean) as AdminCommissionCartItem[];
  }

  if (cart && typeof cart === 'object') {
    return Object.values(cart as Record<string, AdminCommissionCartItem>).filter(Boolean);
  }

  return [];
}

function formatPartyName(party?: AdminCommissionPartyRef): string {
  const firstName = party?.firstName?.trim() ?? '';
  const lastName = party?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || '—';
}

function formatProductNames(items: AdminCommissionCartItem[]): string {
  const names = items
    .map((item) => item.productData?.productName?.trim())
    .filter(Boolean) as string[];

  return names.length > 0 ? names.join(', ') : '—';
}

function toNumber(value?: number | string | null): number {
  if (value == null || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDisplayRow(
  source: AdminCommissionRecord,
  type: AdminCommissionDisplayRow['type'],
  options: {
    orderId: string;
    recipientName: string;
    productNames: string;
    commissionAmount: number;
    payoutAmount?: number;
    affiliateAmount?: number;
    referralAmount?: number;
  },
): AdminCommissionDisplayRow {
  return {
    commissionId: source._id,
    orderId: options.orderId,
    orderDisplayId: formatAdminCommissionOrderDisplayId(options.orderId),
    type,
    payoutStatus: source.payoutStatus?.trim() || 'Pending',
    isPayout: Boolean(source.isPayout),
    commissionAmount: options.commissionAmount,
    payoutAmount: options.payoutAmount,
    affiliateAmount: options.affiliateAmount,
    referralAmount: options.referralAmount,
    recipientName: options.recipientName,
    productNames: options.productNames,
    purchasedAt: source.createdAt,
    rowKey: `${source._id}:${type}`,
  };
}

/**
 * Web parity: group raw page commissions by order, expand seller/affiliate/referral rows.
 * Pagination remains on raw documents — map only the current page's records.
 */
export function mapAdminCommissionRecordsToDisplayRows(
  records: AdminCommissionRecord[],
  roleFilter: AdminCommissionRecipientRoleFilter = '',
): AdminCommissionDisplayRow[] {
  const groupedByOrderId: Record<string, AdminCommissionRecord[]> = {};

  records.forEach((record) => {
    const orderId = getRawOrderId(record);
    if (!orderId) {
      return;
    }

    if (!groupedByOrderId[orderId]) {
      groupedByOrderId[orderId] = [];
    }

    groupedByOrderId[orderId].push(record);
  });

  const displayRows: AdminCommissionDisplayRow[] = [];

  Object.values(groupedByOrderId).forEach((orderGroup) => {
    const orderMeta = orderGroup.find((record) => getRawOrderId(record)) ?? orderGroup[0];
    const cartItems = getCartItems(
      typeof orderMeta.orderId === 'object' && orderMeta.orderId !== null
        ? orderMeta.orderId.cart
        : undefined,
    );
    const orderId = getRawOrderId(orderMeta) ?? '';

    if (!orderId) {
      return;
    }

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
        const sellerCommission = orderGroup.find((record) => record.seller?._id === sellerId);
        if (!sellerCommission) {
          return;
        }

        let totalCommission = 0;
        let totalPayout = 0;

        orderGroup.forEach((record) => {
          if (record.seller?._id === sellerId) {
            totalCommission += toNumber(record.commissionAmount);
            totalPayout += toNumber(record.payoutAmount);
          }
        });

        const seller = sellerDetailsMap[sellerId] ?? sellerCommission.seller;

        displayRows.push(
          buildDisplayRow(sellerCommission, 'seller', {
            orderId,
            recipientName: formatPartyName(seller),
            productNames: formatProductNames(sellerCart),
            commissionAmount: totalCommission,
            payoutAmount: totalPayout,
          }),
        );
      });
    }

    if (roleFilter === 'affiliate' || roleFilter === '') {
      const affiliateCommission = orderGroup.find(
        (record) => record.userId?._id && record.affiliateAmount,
      );

      if (affiliateCommission) {
        let totalAffiliateCommission = 0;
        let affiliatePayout = 0;
        let affiliateUser: AdminCommissionPartyRef | undefined;

        orderGroup.forEach((record) => {
          if (record.userId?._id && record.affiliateAmount) {
            affiliateUser = record.userId;
            totalAffiliateCommission += toNumber(record.commissionAmount);
            affiliatePayout += toNumber(record.affiliateAmount);
          }
        });

        displayRows.push(
          buildDisplayRow(affiliateCommission, 'affiliate', {
            orderId,
            recipientName: formatPartyName(affiliateUser),
            productNames: '—',
            commissionAmount: totalAffiliateCommission,
            affiliateAmount: affiliatePayout,
          }),
        );
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
            totalReferralCommission += toNumber(record.commissionAmount);
            referralPayout += toNumber(record.referralAmount);
          }
        });

        displayRows.push(
          buildDisplayRow(referralCommission, 'referral', {
            orderId,
            recipientName: formatPartyName(referralUser),
            productNames: '—',
            commissionAmount: totalReferralCommission,
            referralAmount: referralPayout,
          }),
        );
      }
    }
  });

  return displayRows;
}
