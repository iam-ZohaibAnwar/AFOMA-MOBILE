/** Approval workflow values for PUT /products/status/{id}. */
export type AdminProductApprovalStatus =
  | 'Pending'
  | 'Review'
  | 'Approved'
  | 'Disapproved'
  | 'Draft';

export type AdminProductVisibilityStatus = 0 | 1;
