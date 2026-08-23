/**
 * Regression checks for admin coupons content helpers (Phase 2 foundation).
 *
 *   npx --yes tsx scripts/test-admin-coupons-content.ts
 */

import assert from 'node:assert/strict';
import type { AdminCouponListItem } from '../src/features/admin/coupons/types/adminCoupons';

import {
  buildAdminCouponUpdatePayload,
  formatAdminCouponDiscount,
  formatAdminCouponType,
  getAdminCouponCreatedById,
  mergeAdminCouponDetail,
  patchAdminCouponInList,
  removeAdminCouponFromList,
} from '../src/features/admin/coupons/utils/adminCouponsContent';
import { isAdminCouponExpired } from '../src/features/admin/coupons/utils/adminCouponsDisplay';
import {
  buildAdminCouponCreatePayload,
  buildAdminCouponEditPayload,
  validateAdminCouponForm,
} from '../src/features/admin/coupons/utils/adminCouponValidation';

const populatedCoupon: AdminCouponListItem = {
  _id: 'coupon-1',
  couponCode: 'SAVE10',
  couponType: 'percentage',
  discountAmount: 10,
  minimumCartAmount: 25,
  createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User', userRole: 'admin' },
};

const updatedCoupon: AdminCouponListItem = {
  _id: 'coupon-1',
  couponCode: 'SAVE10',
  couponType: 'percentage',
  discountAmount: 15,
  minimumCartAmount: 25,
  createdBy: 'admin-1',
};

assert.equal(formatAdminCouponType('percentage'), 'Percentage');
assert.equal(formatAdminCouponType('fixed'), 'Fixed');
assert.equal(formatAdminCouponDiscount({ couponType: 'percentage', discountAmount: 12 }), '12%');
assert.equal(formatAdminCouponDiscount({ couponType: 'fixed', discountAmount: 8 }), '8');
assert.equal(getAdminCouponCreatedById(populatedCoupon), 'admin-1');

const patched = patchAdminCouponInList([populatedCoupon], 'coupon-1', updatedCoupon);
assert.equal(patched[0].discountAmount, 15);
assert.equal(getAdminCouponCreatedById(patched[0]), 'admin-1');
assert.equal(
  typeof patched[0].createdBy === 'object' ? patched[0].createdBy.firstName : null,
  'Admin',
);

const merged = mergeAdminCouponDetail(populatedCoupon, updatedCoupon);
assert.equal(merged?.discountAmount, 15);
assert.equal(getAdminCouponCreatedById(merged!), 'admin-1');

const updatePayload = buildAdminCouponUpdatePayload(populatedCoupon, {
  couponCode: 'SAVE10',
  couponType: 'percentage',
  discountAmount: 20,
  minimumCartAmount: 25,
  expirationDate: '2027-01-01',
  usageLimitPerCoupon: 10,
  usageLimitPerCustomer: 1,
});
assert.equal(updatePayload.createdBy, 'admin-1');

const removed = removeAdminCouponFromList([populatedCoupon], 'coupon-1');
assert.equal(removed.length, 0);

const validForm = {
  couponCode: 'SAVE20',
  couponType: 'percentage' as const,
  description: 'Test',
  discountAmount: '20',
  minimumCartAmount: '50',
  expirationDate: '2027-06-01',
  usageLimitPerCoupon: '100',
  usageLimitPerCustomer: '1',
};

assert.equal(Object.keys(validateAdminCouponForm(validForm)).length, 0);

const invalidPercentage = { ...validForm, discountAmount: '150' };
assert.ok(validateAdminCouponForm(invalidPercentage).discountAmount);

const createResult = buildAdminCouponCreatePayload(validForm, 'admin-1');
assert.equal(createResult.payload?.createdBy, 'admin-1');
assert.equal(createResult.payload?.couponCode, 'SAVE20');

const editResult = buildAdminCouponEditPayload(validForm, populatedCoupon);
assert.equal(editResult.payload?.createdBy, 'admin-1');

assert.equal(isAdminCouponExpired('2000-01-01'), true);
assert.equal(isAdminCouponExpired('2099-01-01'), false);

console.log('admin coupons content tests passed');
