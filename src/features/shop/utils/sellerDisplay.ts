import type { Seller } from '../../../services/types/seller';

function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function createPlaceholderSeller(slug: string): Seller {
  return {
    storeSlug: slug,
    storeTitle: titleCaseFromSlug(slug),
  };
}

export function getSellerStoreTitle(seller: Seller): string {
  if (seller.storeTitle?.trim()) {
    return seller.storeTitle.trim();
  }

  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return fullName || seller.storeSlug?.trim() || 'Shop';
}

export function getSellerLocationLabel(seller: Seller): string | undefined {
  const parts = [seller.city, seller.state, seller.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

export function isSellerShopPaused(seller: Seller | null | undefined): boolean {
  return Number(seller?.shop_status) === 0;
}

export function getSellerAvatarUrl(seller: Seller): string | undefined {
  return seller.storeLogo || seller.userProfile;
}

export function getSellerBannerUrl(seller: Seller): string | undefined {
  return seller.storeBanner;
}

export function getSellerInitials(seller: Seller): string {
  const title = getSellerStoreTitle(seller);
  const parts = title.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return title.slice(0, 2).toUpperCase();
}
