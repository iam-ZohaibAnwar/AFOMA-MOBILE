import type { StandardProductWritePayload } from '../api/sellerProductsApi';
import type { StandardProductFormValues, StandardProductImageEntry } from '../types/standardProductForm';

export function buildStandardProductPayload(
  values: StandardProductFormValues,
  images: StandardProductImageEntry[],
  sellerId: string,
  currencyRate: number,
): StandardProductWritePayload {
  let handlingFee: string | number = values.handlingFee;
  let additionalCost: string | number = values.additionalCost;

  if (values.isCustomShipping) {
    if (values.currency !== 'cad' && values.handlingFee.trim()) {
      handlingFee = parseFloat((parseFloat(values.handlingFee) * currencyRate).toFixed(2));
    }

    if (values.currency !== 'cad' && values.additionalCost.trim()) {
      additionalCost = parseFloat((parseFloat(values.additionalCost) * currencyRate).toFixed(2));
    }
  } else {
    handlingFee = '';
    additionalCost = '';
  }

  const discountValue = parseFloat(values.discountCode);
  const discountCode =
    values.discountCode.trim() && Number.isFinite(discountValue) && discountValue > 0
      ? values.discountCode
      : '';

  return {
    productName: values.productName.trim(),
    description: values.description.trim(),
    Category: values.categoryId,
    SubCategory: values.subCategoryId,
    childCategory: values.childCategoryId || null,
    inventory: values.inventory,
    quantity: values.quantity.trim(),
    price: values.price.trim(),
    weight: values.weight.trim(),
    length: values.length.trim(),
    width: values.width.trim(),
    height: values.height.trim(),
    dispatchDays: values.dispatchDays.trim(),
    commodityCode: values.commodityCode.trim() || undefined,
    metaTitle: values.metaTitle.trim() || undefined,
    metaKeywords: values.metaKeywords.trim() || undefined,
    metaDesc: values.metaDesc.trim() || undefined,
    discountCode,
    seller: sellerId,
    images: images
      .filter((image) => image.imageUrl && image.fileName)
      .map((image) => ({
        imageUrl: image.imageUrl!,
        fileName: image.fileName!,
        altText: image.altText.trim(),
      })),
    videos: [],
    productType: 'Standard',
    freeDelivery: values.isCustomShipping ? values.freeDelivery : false,
    handlingFee,
    additionalCost,
    currency: values.currency || 'cad',
    currencyPrice: values.currencyPrice.trim() ? values.currencyPrice.trim() : 1,
    currencyRate: currencyRate || 1,
  };
}
