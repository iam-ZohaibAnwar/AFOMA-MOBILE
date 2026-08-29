import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import type { CartLineItem } from '../../../../services/types/cart';
import { formatCadAmount } from '../../../../utils/currencyFormat';
import { formatCustomerName, formatOrderDate, formatOrderDisplayId } from '../../../orders/utils/orderDisplay';
import type { SellerCommissionRecord, SellerEarningLineItem } from '../types/sellerEarning';

export function formatSellerEarningAmount(amount?: number | string | null): string {
  return formatCadAmount(amount);
}

export function formatSellerEarningSummaryAmount(amount?: number | string | null): string {
  return formatCadAmount(amount, 'CAD 0.00');
}

export function formatSellerEarningOrderId(record: SellerCommissionRecord): string {
  return formatOrderDisplayId(record.orderId?._id);
}

export function formatSellerEarningCustomerName(record: SellerCommissionRecord): string {
  return formatCustomerName(record.orderId?.userInfo) ?? '—';
}

export function formatSellerEarningDate(record: SellerCommissionRecord): string {
  return formatOrderDate(record.createdAt);
}

export function formatPayoutStatus(status?: string): string {
  return status?.trim() || '—';
}

export function payoutStatusBadgeVariant(status?: string): AppBadgeProps['variant'] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'paid') {
    return 'success';
  }

  if (normalized === 'pending' || normalized === 'inprocess' || normalized === 'in process') {
    return 'warning';
  }

  return 'neutral';
}

function getCartItems(cart: unknown): CartLineItem[] {
  if (Array.isArray(cart)) {
    return cart.filter(Boolean) as CartLineItem[];
  }

  if (cart && typeof cart === 'object') {
    return Object.values(cart as Record<string, CartLineItem>).filter(Boolean);
  }

  return [];
}

function formatLineTotal(amount?: number | string): string {
  if (amount == null || amount === '') {
    return '—';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '—';
  }

  return value.toFixed(2);
}

function formatQuantity(quantity?: number | string): string {
  if (quantity == null || quantity === '') {
    return '—';
  }

  return String(quantity);
}

/** Web parity: only cart lines belonging to this commission's seller. */
export function getSellerEarningLineItems(record: SellerCommissionRecord): SellerEarningLineItem[] {
  const sellerId = record.seller?._id;
  const items = getCartItems(record.orderId?.cart);

  const sellerItems = items.filter((item) => {
    if (!sellerId) {
      return true;
    }

    return item.productData?.seller?._id === sellerId;
  });

  if (sellerItems.length === 0) {
    return [];
  }

  return sellerItems.map((item) => ({
    productName: item.productData?.productName?.trim() || '—',
    sku: item.productData?.sku?.trim() || '—',
    quantity: formatQuantity(item.orderQuantiy),
    lineTotal: formatLineTotal(item.totalAmount),
  }));
}

export function commissionMatchesProductSearch(
  record: SellerCommissionRecord,
  searchTerm: string,
): boolean {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const lineItems = getSellerEarningLineItems(record);
  return lineItems.some((item) => item.productName.toLowerCase().includes(normalized));
}
