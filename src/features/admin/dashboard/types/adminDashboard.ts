export interface AdminTotalSalesSummary {
  totalOrderPrice?: number | string;
  totalOrders?: number | string;
  averageOrderPrice?: number | string;
}

export interface AdminUserCounts {
  userCount?: number | string;
  approvedSellersCount?: number | string;
  affiliateCount?: number | string;
}

export interface AdminProductStockStatus {
  outOfStockCount?: number | string | null;
  lowStockCount?: number | string | null;
}

export interface AdminSellerTotalCount {
  totalSellersCount?: number | string;
}

export interface AdminPendingProductCount {
  pendingProductCount?: number | string | null;
}

export interface AdminPendingPayoutCount {
  pendingPayoutsCount?: number | string | null;
}

export interface AdminTotalOrdersCount {
  totalOrders?: number | string;
}

export interface AdminPendingOrdersCount {
  pendingOrdersCount?: number | string | null;
}

export interface AdminLatestSeller {
  _id?: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole?: string;
  city?: string;
  phone?: string;
  country?: string;
  state?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminLatestProduct {
  productName?: string;
  productType?: string;
  finalPrice?: number | string;
  variations?: Array<{ finalPrice?: number | string; price?: number | string }>;
}

export interface AdminPopularSearchTerm {
  _id?: string;
  count?: number | string;
}

export interface AdminLatestSellersResponse {
  data?: AdminLatestSeller[];
}

export interface AdminLatestProductsResponse {
  data?: AdminLatestProduct[];
}

export type AdminDashboardLatestTab = 'products' | 'sellers' | 'searches';

export interface AdminDashboardErrors {
  totalSales?: string;
  userCounts?: string;
  stockStatus?: string;
  sellerCount?: string;
  pendingProducts?: string;
  pendingPayouts?: string;
  totalOrders?: string;
  pendingOrders?: string;
  latestSellers?: string;
  latestProducts?: string;
  searchTerms?: string;
}
