import { buildStorefrontProductUrl } from '../../../utils/storefrontUrl';

export function getProductShareUrl(slug?: string, productId?: string): string | undefined {
  return buildStorefrontProductUrl(slug, productId);
}
