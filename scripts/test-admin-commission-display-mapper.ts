/**
 * Admin commission display-mapper + record-merge regression tests.
 * Run: npx --yes tsx scripts/test-admin-commission-display-mapper.ts
 */
import { mapAdminCommissionRecordsToDisplayRows } from '../src/features/admin/commission/utils/adminCommissionDisplayMapper';
import {
  mergeAdminCommissionRecord,
  replaceAdminCommissionInPage,
} from '../src/features/admin/commission/utils/adminCommissionRecordMerge';
import type {
  AdminCommissionCartItem,
  AdminCommissionRecord,
} from '../src/features/admin/commission/types/adminCommission';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function seller(id: string, firstName: string, lastName: string) {
  return { _id: id, firstName, lastName };
}

function cartItem(sellerId: string, productName: string, sku: string): AdminCommissionCartItem {
  return {
    orderQuantiy: 1,
    totalAmount: 50,
    productData: {
      productName,
      sku,
      seller: seller(sellerId, 'Seller', 'One'),
    },
  };
}

function populatedOrder(orderId: string, items: AdminCommissionCartItem[]) {
  return {
    _id: orderId,
    orderId: `ORDER-${orderId}`,
    cart: items,
    paymentStatus: 'PaymentDone',
  };
}

function baseRecord(partial: Partial<AdminCommissionRecord> & { _id: string }): AdminCommissionRecord {
  return {
    payoutStatus: 'Pending',
    isPayout: false,
    commissionAmount: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function testSellerOnly() {
  const records = [
    baseRecord({
      _id: 'seller-doc-1',
      seller: seller('s1', 'Alice', 'Artisan'),
      payoutAmount: 40,
      commissionAmount: 8,
      orderId: populatedOrder('order-1', [cartItem('s1', 'Bracelet', 'BR-1')]),
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  assert(rows.length === 1, 'seller only → one row');
  assert(rows[0].commissionId === 'seller-doc-1', 'seller commissionId');
  assert(rows[0].type === 'seller', 'seller type');
  assert(rows[0].orderId === 'order-1', 'seller orderId');
  assert(rows[0].recipientName === 'Seller One', 'seller recipient');
  assert(rows[0].payoutAmount === 40, 'seller payout amount');
  assert(rows[0].productNames.includes('Bracelet'), 'seller product names');
}

function testSellerAndReferralSameOrder() {
  const records = [
    baseRecord({
      _id: 'seller-doc-2',
      seller: seller('s1', 'Alice', 'Artisan'),
      payoutAmount: 30,
      commissionAmount: 6,
      orderId: populatedOrder('order-2', [cartItem('s1', 'Ring', 'RG-1')]),
    }),
    baseRecord({
      _id: 'referral-doc-2',
      userId: seller('u1', 'Bob', 'Buyer'),
      referralAmount: 2,
      commissionAmount: 1,
      orderId: populatedOrder('order-2', [cartItem('s1', 'Ring', 'RG-1')]),
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  assert(rows.length === 2, 'seller + referral → two rows');

  const sellerRow = rows.find((row) => row.type === 'seller');
  const referralRow = rows.find((row) => row.type === 'referral');

  assert(sellerRow?.commissionId === 'seller-doc-2', 'seller keeps seller doc id');
  assert(referralRow?.commissionId === 'referral-doc-2', 'referral keeps referral doc id');
  assert(Boolean(sellerRow?.orderId === 'order-2' && referralRow?.orderId === 'order-2'), 'shared order');
  assert(referralRow?.referralAmount === 2, 'referral amount');
}

function testSellerAffiliateReferralTriple() {
  const order = populatedOrder('order-3', [cartItem('s1', 'Necklace', 'NK-1')]);
  const records = [
    baseRecord({
      _id: 'seller-doc-3',
      seller: seller('s1', 'Alice', 'Artisan'),
      payoutAmount: 20,
      orderId: order,
    }),
    baseRecord({
      _id: 'affiliate-doc-3',
      userId: seller('u2', 'Cara', 'Affiliate'),
      affiliateAmount: 3,
      orderId: order,
    }),
    baseRecord({
      _id: 'referral-doc-3',
      userId: seller('u3', 'Dan', 'Referrer'),
      referralAmount: 1.5,
      orderId: order,
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  assert(rows.length === 3, 'seller + affiliate + referral → three rows');
  assert(new Set(rows.map((row) => row.commissionId)).size === 3, 'unique commission ids');
}

function testMultipleSellersOneOrder() {
  const records = [
    baseRecord({
      _id: 'seller-a',
      seller: seller('s1', 'Alice', 'A'),
      payoutAmount: 10,
      orderId: populatedOrder('order-4', [
        cartItem('s1', 'Item A', 'A-1'),
        cartItem('s2', 'Item B', 'B-1'),
      ]),
    }),
    baseRecord({
      _id: 'seller-b',
      seller: seller('s2', 'Ben', 'B'),
      payoutAmount: 15,
      orderId: populatedOrder('order-4', [
        cartItem('s1', 'Item A', 'A-1'),
        cartItem('s2', 'Item B', 'B-1'),
      ]),
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  assert(rows.length === 2, 'two sellers → two rows');
  assert(rows.every((row) => row.orderId === 'order-4'), 'same order id');
  assert(
    Boolean(rows.find((row) => row.commissionId === 'seller-a')?.productNames.includes('Item A')),
    'seller A products',
  );
  assert(
    Boolean(rows.find((row) => row.commissionId === 'seller-b')?.productNames.includes('Item B')),
    'seller B products',
  );
}

function testReferralWithoutSellerCartMatch() {
  const records = [
    baseRecord({
      _id: 'referral-only',
      userId: seller('u4', 'Eve', 'Referrer'),
      referralAmount: 0.5,
      orderId: populatedOrder('order-5', []),
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  assert(rows.length === 1, 'referral-only row');
  assert(rows[0].type === 'referral', 'referral type');
  assert(rows[0].commissionId === 'referral-only', 'referral commission id');
}

function testPaidAndIsPayoutFlags() {
  const records = [
    baseRecord({
      _id: 'paid-doc',
      payoutStatus: 'Paid',
      isPayout: false,
      seller: seller('s1', 'Alice', 'A'),
      payoutAmount: 12,
      orderId: populatedOrder('order-6', [cartItem('s1', 'Paid Item', 'P-1')]),
    }),
    baseRecord({
      _id: 'initiated-doc',
      payoutStatus: 'Pending',
      isPayout: true,
      seller: seller('s1', 'Alice', 'A'),
      payoutAmount: 8,
      orderId: populatedOrder('order-7', [cartItem('s1', 'Init Item', 'I-1')]),
    }),
  ];

  const rows = mapAdminCommissionRecordsToDisplayRows(records);
  const paidRow = rows.find((row) => row.commissionId === 'paid-doc');
  const initiatedRow = rows.find((row) => row.commissionId === 'initiated-doc');

  assert(paidRow?.payoutStatus === 'Paid', 'paid status preserved');
  assert(paidRow?.isPayout === false, 'paid + isPayout false preserved');
  assert(initiatedRow?.isPayout === true, 'isPayout true preserved');
}

function testMergePreservesPopulatedCartAfterSparsePut() {
  const existing = baseRecord({
    _id: 'merge-doc',
    seller: seller('s1', 'Alice', 'A'),
    payoutAmount: 25,
    orderId: populatedOrder('order-8', [cartItem('s1', 'Merged Item', 'M-1')]),
  });

  const sparseIncoming: AdminCommissionRecord = {
    _id: 'merge-doc',
    payoutStatus: 'Paid',
    isPayout: false,
    orderId: 'order-8',
    commissionAmount: 10,
  };

  const merged = mergeAdminCommissionRecord(existing, sparseIncoming);
  const rows = mapAdminCommissionRecordsToDisplayRows([merged]);

  assert(merged.payoutStatus === 'Paid', 'merged payout status from server');
  assert(typeof merged.orderId === 'object', 'orderId stays populated object');
  assert(Array.isArray((merged.orderId as { cart?: unknown }).cart), 'cart preserved after merge');
  assert(rows[0].productNames.includes('Merged Item'), 'display row keeps product names after merge');

  const page = replaceAdminCommissionInPage([existing], sparseIncoming);
  const pageRows = mapAdminCommissionRecordsToDisplayRows(page);
  assert(pageRows[0].payoutStatus === 'Paid', 'page merge payout status');
  assert(pageRows[0].productNames.includes('Merged Item'), 'page merge keeps cart-derived products');
}

function testRoleFilterClientSide() {
  const order = populatedOrder('order-9', [cartItem('s1', 'Filtered', 'F-1')]);
  const records = [
    baseRecord({ _id: 'seller-9', seller: seller('s1', 'A', 'A'), payoutAmount: 1, orderId: order }),
    baseRecord({
      _id: 'referral-9',
      userId: seller('u9', 'R', 'R'),
      referralAmount: 1,
      orderId: order,
    }),
  ];

  const sellerOnly = mapAdminCommissionRecordsToDisplayRows(records, 'seller');
  const referralOnly = mapAdminCommissionRecordsToDisplayRows(records, 'referral');

  assert(sellerOnly.length === 1 && sellerOnly[0].type === 'seller', 'role filter seller');
  assert(referralOnly.length === 1 && referralOnly[0].type === 'referral', 'role filter referral');
}

function run() {
  testSellerOnly();
  testSellerAndReferralSameOrder();
  testSellerAffiliateReferralTriple();
  testMultipleSellersOneOrder();
  testReferralWithoutSellerCartMatch();
  testPaidAndIsPayoutFlags();
  testMergePreservesPopulatedCartAfterSparsePut();
  testRoleFilterClientSide();
  console.log('All admin commission display-mapper tests passed.');
}

run();
