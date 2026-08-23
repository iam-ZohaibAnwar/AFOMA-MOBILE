import type { SellerInventoryValue } from '../utils/standardProductConstants';

export interface DownloadableProductFormValues {
  productName: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  childCategoryId: string;
  inventory: '' | SellerInventoryValue;
  price: string;
  currency: string;
  currencyPrice: string;
  commodityCode: string;
  metaTitle: string;
  metaKeywords: string;
  metaDesc: string;
  discountCode: string;
  productStatus?: string;
}

export interface DownloadableFileEntry {
  featuredProduct: string;
  featuredProductUrl: string;
  localUri?: string;
  fileName?: string;
  isUploading?: boolean;
  uploadError?: string;
}

export function createEmptyDownloadableProductForm(): DownloadableProductFormValues {
  return {
    productName: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    childCategoryId: '',
    inventory: '',
    price: '',
    currency: 'cad',
    currencyPrice: '',
    commodityCode: '',
    metaTitle: '',
    metaKeywords: '',
    metaDesc: '',
    discountCode: '',
  };
}
