import type { AdminSellerApprovalChoice } from '../types/adminSellerManagement';

/**
 * Web parity for PUT /sellers/change-status/{id}
 * Verified in admin seller-management edit routes (basic-information, address, seller-details, payment-information).
 */
export function resolveAdminSellerChangeStatusPayload(status: AdminSellerApprovalChoice): {
  status: AdminSellerApprovalChoice;
  userRole: 'seller' | 'customer';
} {
  return {
    status,
    userRole: status === 'Approved' ? 'seller' : 'customer',
  };
}
