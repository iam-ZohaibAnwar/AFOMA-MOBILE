import type { CustomizableProductFormValues } from '../../../seller/products/types/customizableProductForm';
import type { DownloadableProductFormValues } from '../../../seller/products/types/downloadableProductForm';
import type {
  StandardProductFormValues,
  StandardProductImageEntry,
} from '../../../seller/products/types/standardProductForm';

export type AdminProductAiListingType = 'Standard' | 'Downloadable' | 'Customizable';

export interface AdminProductAiListingImageAltSuggestion {
  imageNumber?: number;
  altText?: string;
}

export interface AdminProductAiListingResponse {
  product_title?: string;
  product_description?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_title?: string;
  hsCode?: string | { code?: string | number };
  commodityCode?: string;
  category?: string;
  subcategory?: string;
  categoryReason?: string;
  category_id?: string;
  subcategory_id?: string;
  imageAltSuggestions?: AdminProductAiListingImageAltSuggestion[];
}

export interface AdminProductAiPrefill {
  productType: AdminProductAiListingType;
  sellerId?: string;
  standardValues?: Partial<StandardProductFormValues>;
  downloadableValues?: Partial<DownloadableProductFormValues>;
  customizableValues?: Partial<CustomizableProductFormValues>;
  images: StandardProductImageEntry[];
  categoryHint?: string;
  subcategoryHint?: string;
}

export interface AdminProductAiLocalImage {
  id: string;
  uri: string;
  mimeType?: string;
  fileName: string;
}
