/**
 * Regression checks for admin reviews content helpers (Phase 2 foundation).
 *
 *   npx --yes tsx scripts/test-admin-reviews-content.ts
 */

import assert from 'node:assert/strict';

import type { AdminReviewListItem } from '../src/features/admin/reviews/types/adminReviews';
import {
  filterAdminReviewsByStatus,
  getAdminReviewCustomerName,
  getAdminReviewProductName,
  mergeAdminReviewDetail,
  patchAdminReviewInList,
} from '../src/features/admin/reviews/utils/adminReviewsContent';

const populatedReview: AdminReviewListItem = {
  _id: 'review-1',
  reviewStatus: 'Pending',
  title: 'Great product',
  UserId: { firstName: 'Ada', lastName: 'Lovelace' },
  productId: { _id: 'prod-1', productName: 'Handmade Bowl' },
};

const updatedReview: AdminReviewListItem = {
  _id: 'review-1',
  reviewStatus: 'Approved',
  title: 'Great product',
  UserId: 'user-1',
  productId: 'prod-1',
};

assert.equal(filterAdminReviewsByStatus([populatedReview], '').length, 1);
assert.equal(filterAdminReviewsByStatus([populatedReview], 'Approved').length, 0);
assert.equal(filterAdminReviewsByStatus([populatedReview], 'Pending').length, 1);

const patched = patchAdminReviewInList([populatedReview], 'review-1', updatedReview);
assert.equal(patched[0].reviewStatus, 'Approved');
assert.equal(getAdminReviewCustomerName(patched[0]), 'Ada Lovelace');
assert.equal(getAdminReviewProductName(patched[0]), 'Handmade Bowl');

const merged = mergeAdminReviewDetail(populatedReview, updatedReview);
assert.equal(merged?.reviewStatus, 'Approved');
assert.equal(getAdminReviewCustomerName(merged!), 'Ada Lovelace');

console.log('admin reviews content tests passed');
