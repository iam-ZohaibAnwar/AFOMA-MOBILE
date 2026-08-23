import type { Product, ProductCategoryRef, ProductVariation } from '../../../../services/types/product';
import { getProductById } from '../../../../services/api/productsApi';
import { apiClient } from '../../../../services/api/client';
import { apiGet, apiPost, apiPut } from '../../../../services/api/request';
import { toApiError } from '../../../../services/api/errors';

export interface CreateProductResponse {
  newProduct?: Product;
}

export interface UpdateProductResponse {
  updatedProduct?: Product;
}

export interface UpdateVariationsResponse {
  product?: Product;
}

export interface UploadProductImageResponse {
  imageUrl: string;
  featuredimage: string;
}

export interface UploadDownloadableFileResponse {
  featuredProduct: string;
  featuredProductUrl: string;
}

export interface GlobalAttributesResponse {
  global?: string[];
  local?: string[];
}

export interface ProductImagePayload {
  imageUrl: string;
  fileName: string;
  altText: string;
}

export interface DownloadableLinkPayload {
  featuredProduct: string;
  featuredProductUrl: string;
}

/** Shared seller product write payload fields. */
export interface SellerProductWritePayload {
  productName: string;
  description: string;
  Category: string;
  SubCategory: string;
  childCategory: string | null;
  commodityCode?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDesc?: string;
  discountCode?: string;
  seller: string;
  images: ProductImagePayload[];
  videos: [];
  productType: 'Standard' | 'Customizable' | 'Downloadable';
  currency: string;
  currencyPrice: number | string;
  currencyRate: number;
  productStatus?: string;
}

export interface StandardProductWritePayload extends SellerProductWritePayload {
  productType: 'Standard';
  inventory: string;
  quantity: string;
  price: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  dispatchDays: string;
  freeDelivery: boolean;
  handlingFee: string | number;
  additionalCost: string | number;
}

export interface DownloadableProductWritePayload extends SellerProductWritePayload {
  productType: 'Downloadable';
  inventory: string;
  price: string;
  downloadableLink: DownloadableLinkPayload;
}

export interface CustomizableProductWritePayload extends SellerProductWritePayload {
  productType: 'Customizable';
  weight: string;
  length: string;
  width: string;
  height: string;
  dispatchDays: string;
  freeDelivery: boolean;
  handlingFee: string | number;
  additionalCost: string | number;
}

export type SellerProductCreatePayload =
  | StandardProductWritePayload
  | DownloadableProductWritePayload
  | CustomizableProductWritePayload;

/** GET /products/{id} — load product for edit. */
export async function getSellerProductById(productId: string): Promise<Product> {
  return getProductById(productId);
}

/** POST /products */
export async function createProduct(payload: SellerProductCreatePayload): Promise<Product> {
  const response = await apiPost<CreateProductResponse>(
    '/products',
    payload,
    undefined,
    'Failed to create product',
  );

  const product = response.newProduct;
  if (!product?._id) {
    throw toApiError(new Error('Product created but no ID returned'), 'Failed to create product');
  }

  return product;
}

/** PUT /products/{productId} */
export async function updateProduct(
  productId: string,
  payload: SellerProductCreatePayload,
): Promise<Product> {
  const response = await apiPut<UpdateProductResponse>(
    `/products/${encodeURIComponent(productId)}`,
    payload,
    undefined,
    'Failed to update product',
  );

  const product = response.updatedProduct;
  if (!product?._id) {
    throw toApiError(new Error('Product updated but no product returned'), 'Failed to update product');
  }

  return product;
}

/** PUT /products/variations/{productId} */
export async function updateProductVariations(
  productId: string,
  variations: ProductVariation[],
): Promise<Product> {
  const response = await apiPut<UpdateVariationsResponse>(
    `/products/variations/${encodeURIComponent(productId)}`,
    { variations },
    undefined,
    'Failed to save product variations',
  );

  const product = response.product;
  if (!product?._id) {
    throw toApiError(new Error('Variations saved but no product returned'), 'Failed to save variations');
  }

  return product;
}

/** PUT /products/status/{productId} */
export async function submitProductForReview(productId: string): Promise<void> {
  await apiPut<void>(
    `/products/status/${encodeURIComponent(productId)}`,
    { productStatus: 'Review' },
    undefined,
    'Failed to submit product for review',
  );
}

/** POST /products/update-status — bulk/single active toggle. */
export async function updateProductsActiveStatus(
  productIds: string[],
  status: 0 | 1,
): Promise<void> {
  await apiPost<void>(
    '/products/update-status',
    { status, ids: productIds },
    undefined,
    'Failed to update product status',
  );
}

/** GET /global-attribute/all/{sellerId} */
export async function getSellerGlobalAttributes(sellerId: string): Promise<string[]> {
  const response = await apiGet<GlobalAttributesResponse>(
    `/global-attribute/all/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to load product attributes',
  );

  const merged = [...(response.global ?? []), ...(response.local ?? [])];
  return [...new Set(merged)];
}

/** POST /products/upload-image */
export async function uploadProductImage(
  localUri: string,
  fileName: string,
  mimeType = 'image/jpeg',
): Promise<{ imageUrl: string; fileName: string }> {
  const formData = new FormData();
  formData.append('featuredimage', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    const response = await apiClient.post<UploadProductImageResponse>(
      '/products/upload-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return {
      imageUrl: response.data.imageUrl,
      fileName: response.data.featuredimage,
    };
  } catch (error) {
    throw toApiError(error, 'Failed to upload image');
  }
}

/** POST /download/upload-product-file */
export async function uploadDownloadableFile(
  localUri: string,
  fileName: string,
  mimeType: string,
): Promise<DownloadableLinkPayload> {
  const formData = new FormData();
  formData.append('productFile', {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    const response = await apiClient.post<UploadDownloadableFileResponse>(
      '/download/upload-product-file',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return {
      featuredProduct: response.data.featuredProduct,
      featuredProductUrl: response.data.featuredProductUrl,
    };
  } catch (error) {
    throw toApiError(error, 'Failed to upload downloadable file');
  }
}

export function resolveCategoryId(category?: string | ProductCategoryRef | null): string {
  if (!category) {
    return '';
  }

  if (typeof category === 'string') {
    return category;
  }

  return category._id ?? '';
}

export function canSubmitProductForReview(productStatus?: string): boolean {
  return productStatus !== 'Approved' && productStatus !== 'Review';
}

export function productImagesFromProduct(product: Product): ProductImagePayload[] {
  return (product.images ?? []).map((image) => ({
    imageUrl: image.imageUrl ?? '',
    fileName: image.fileName ?? '',
    altText: image.altText ?? '',
  }));
}
