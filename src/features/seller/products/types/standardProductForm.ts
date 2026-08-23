import type { SellerInventoryValue } from '../utils/standardProductConstants';

export interface StandardProductFormValues {
  productName: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  childCategoryId: string;
  inventory: '' | SellerInventoryValue;
  quantity: string;
  price: string;
  currency: string;
  currencyPrice: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  dispatchDays: string;
  isCustomShipping: boolean;
  freeDelivery: boolean;
  handlingFee: string;
  additionalCost: string;
  commodityCode: string;
  metaTitle: string;
  metaKeywords: string;
  metaDesc: string;
  discountCode: string;
}

export interface StandardProductImageEntry {
  id: string;
  localUri?: string;
  imageUrl?: string;
  fileName?: string;
  altText: string;
  isUploading?: boolean;
  uploadError?: string;
}

export function createEmptyStandardProductForm(): StandardProductFormValues {
  return {
    productName: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    childCategoryId: '',
    inventory: '',
    quantity: '',
    price: '',
    currency: 'cad',
    currencyPrice: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    dispatchDays: '',
    isCustomShipping: false,
    freeDelivery: false,
    handlingFee: '',
    additionalCost: '',
    commodityCode: '',
    metaTitle: '',
    metaKeywords: '',
    metaDesc: '',
    discountCode: '',
  };
}
