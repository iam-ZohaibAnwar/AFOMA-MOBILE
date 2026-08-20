import type {
  GetShippingRateRequest,
  GetShippingRateResponse,
  ProductShippingDestinationsResponse,
  ProductShippingEstimateRequest,
  ProductShippingEstimateResponse,
  UserSurchargeResponse,
} from '../types/shipping';
import { apiGet, apiPost } from './request';

/** POST /shipping/getRate — cart shipping quotes */
export async function getShippingRates(body: GetShippingRateRequest): Promise<GetShippingRateResponse> {
  return apiPost<GetShippingRateResponse>('/shipping/getRate', body, undefined, 'Failed to load shipping rates');
}

/** GET /shipping/product-create-estimate-destinations?seller={sellerId} */
export async function getProductShippingEstimateDestinations(
  sellerId: string,
): Promise<ProductShippingDestinationsResponse> {
  return apiGet<ProductShippingDestinationsResponse>(
    '/shipping/product-create-estimate-destinations',
    { params: { seller: sellerId } },
    'Failed to load shipping estimate destinations',
  );
}

/** POST /shipping/product-create-estimates */
export async function createProductShippingEstimate(
  body: ProductShippingEstimateRequest,
): Promise<ProductShippingEstimateResponse> {
  return apiPost<ProductShippingEstimateResponse>(
    '/shipping/product-create-estimates',
    body,
    undefined,
    'Failed to create product shipping estimate',
  );
}

/** GET /shipping-config/user-surcharge?userCountry={country} — geo pricing surcharge map */
export async function getUserShippingSurcharge(userCountry: string): Promise<UserSurchargeResponse> {
  return apiGet<UserSurchargeResponse>(
    '/shipping-config/user-surcharge',
    { params: { userCountry } },
    'Failed to load user shipping surcharge',
  );
}
