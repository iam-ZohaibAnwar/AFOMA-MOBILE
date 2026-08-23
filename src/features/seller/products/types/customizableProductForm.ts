export interface CustomizableProductFormValues {
  productName: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  childCategoryId: string;
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
  currency: string;
  currencyPrice: string;
  productStatus?: string;
}

export function createEmptyCustomizableProductForm(): CustomizableProductFormValues {
  return {
    productName: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    childCategoryId: '',
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
    currency: 'cad',
    currencyPrice: '1',
  };
}

export interface VariationRow {
  id: string;
  inventory: string;
  quantity: string;
  price: string;
  currencyPrice: string;
  image: string;
  [attribute: string]: string;
}

export function createEmptyVariationRow(attributeNames: string[]): VariationRow {
  const row: VariationRow = {
    id: `variation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inventory: '',
    quantity: '',
    price: '',
    currencyPrice: '',
    image: '',
  };

  attributeNames.forEach((attribute) => {
    row[attribute] = '';
  });

  return row;
}
