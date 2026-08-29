import type { Product } from '../types/product';
import type { OrderSummary } from '../types/order';
import type { Review } from '../types/review';
import type { Seller } from '../types/seller';
import type { SellerProfile } from '../../features/seller/types/sellerProfile';
import type { SubCategoryBrowserSection } from '../../features/categories/types/subCategoryBrowser';
import type { ChatSummary } from '../../features/chat/types/chat';
import type { BellNotification } from '../../features/notifications/types';
import type { AffiliateCommissionRecord } from '../types/commission';
import type { ReferralEarningsSummary } from '../../features/account/referral-earnings/types/referralEarning';

export interface ReferralEarningsListCacheEntry {
  commissions: AffiliateCommissionRecord[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  statusFilter: string;
}

const referralEarningsListCache = new Map<string, ReferralEarningsListCacheEntry>();
const referralEarningsSummaryCache = new Map<string, ReferralEarningsSummary>();

export function buildReferralEarningsListCacheKey(
  userId: string,
  page: number,
  statusFilter: string,
): string {
  return `${userId}:${page}:${statusFilter || 'all'}`;
}

export function getReferralEarningsListCache(key: string): ReferralEarningsListCacheEntry | undefined {
  return referralEarningsListCache.get(key);
}

export function setReferralEarningsListCache(key: string, entry: ReferralEarningsListCacheEntry): void {
  referralEarningsListCache.set(key, entry);
}

export function getReferralEarningsSummaryCache(userId: string): ReferralEarningsSummary | undefined {
  return referralEarningsSummaryCache.get(userId);
}

export function setReferralEarningsSummaryCache(userId: string, summary: ReferralEarningsSummary): void {
  referralEarningsSummaryCache.set(userId, summary);
}

export interface OrdersListCacheEntry {
  orders: OrderSummary[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

export interface ShopCacheEntry {
  seller: Seller;
  products: Product[];
  reviews: Review[];
}

const shopCache = new Map<string, ShopCacheEntry>();
const productCache = new Map<string, Product>();
const listingCache = new Map<string, Product[]>();
const categorySectionsCache = new Map<string, SubCategoryBrowserSection[]>();
const sellerProfileCache = new Map<string, SellerProfile>();
const ordersListCache = new Map<string, OrdersListCacheEntry>();
const chatInboxCache = new Map<string, ChatSummary[]>();
const bellNotificationsCache = new Map<string, BellNotification[]>();

const ORDERS_LIST_CACHE_VERSION = 2;

export function buildOrdersListCacheKey(userId: string, page: number): string {
  return `${userId}:${page}:v${ORDERS_LIST_CACHE_VERSION}`;
}

export function getOrdersListCache(key: string): OrdersListCacheEntry | undefined {
  return ordersListCache.get(key);
}

export function setOrdersListCache(key: string, entry: OrdersListCacheEntry): void {
  ordersListCache.set(key, entry);
}

export function getChatInboxCache(userId: string): ChatSummary[] | undefined {
  return chatInboxCache.get(userId);
}

export function setChatInboxCache(userId: string, chats: ChatSummary[]): void {
  chatInboxCache.set(userId, chats);
}

export function getBellNotificationsCache(userId: string): BellNotification[] | undefined {
  return bellNotificationsCache.get(userId);
}

export function setBellNotificationsCache(userId: string, notifications: BellNotification[]): void {
  bellNotificationsCache.set(userId, notifications);
}

export function getShopCache(slug: string): ShopCacheEntry | undefined {
  return shopCache.get(slug);
}

export function setShopCache(slug: string, entry: ShopCacheEntry): void {
  shopCache.set(slug, entry);
}

export function getProductCacheKey(productId?: string, slug?: string): string {
  return productId ?? slug ?? '';
}

export function getProductCache(key: string): Product | undefined {
  return productCache.get(key);
}

export function setProductCache(key: string, product: Product): void {
  productCache.set(key, product);
}

export function buildListingCacheKey(filters: unknown): string {
  return JSON.stringify(filters);
}

export function getListingCache(key: string): Product[] | undefined {
  return listingCache.get(key);
}

export function setListingCache(key: string, products: Product[]): void {
  listingCache.set(key, products);
}

export function buildSearchCacheKey(query: string): string {
  return `search:${query.trim().toLowerCase()}`;
}

export function getCategorySectionsCache(categoryId: string): SubCategoryBrowserSection[] | undefined {
  return categorySectionsCache.get(categoryId);
}

export function setCategorySectionsCache(
  categoryId: string,
  sections: SubCategoryBrowserSection[],
): void {
  categorySectionsCache.set(categoryId, sections);
}

export function getSellerProfileCache(sellerId: string): SellerProfile | undefined {
  return sellerProfileCache.get(sellerId);
}

export function setSellerProfileCache(sellerId: string, profile: SellerProfile): void {
  sellerProfileCache.set(sellerId, profile);
}

let termsConditionsHtmlCache: string | undefined;

export function getTermsConditionsCache(): string | undefined {
  return termsConditionsHtmlCache;
}

export function setTermsConditionsCache(html: string): void {
  termsConditionsHtmlCache = html;
}
