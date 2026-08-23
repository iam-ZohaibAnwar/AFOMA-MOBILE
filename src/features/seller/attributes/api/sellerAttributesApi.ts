import { apiDelete, apiGet, apiPut } from '../../../../services/api/request';
import type {
  AddSellerAttributePayload,
  DeleteSellerAttributePayload,
  SellerAttributeListItem,
  SellerAttributesListResponse,
  UpdateSellerAttributePayload,
} from '../types/sellerAttribute';

function mapAttributeDocuments(response: SellerAttributesListResponse): SellerAttributeListItem[] {
  const document = Array.isArray(response) ? response[0] : undefined;
  const names = Array.isArray(document?.attributes) ? document.attributes : [];

  return names.map((name, index) => ({
    name,
    index,
  }));
}

/** GET /attributes/single/{sellerId} */
export async function getSellerAttributes(sellerId: string): Promise<SellerAttributeListItem[]> {
  const response = await apiGet<SellerAttributesListResponse>(
    `/attributes/single/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to load custom attributes',
  );

  return mapAttributeDocuments(response);
}

/** PUT /attributes/update/{sellerId} */
export async function addSellerAttribute(
  sellerId: string,
  payload: AddSellerAttributePayload,
): Promise<void> {
  await apiPut<void>(
    `/attributes/update/${encodeURIComponent(sellerId)}`,
    payload,
    undefined,
    'Failed to add attribute',
  );
}

/**
 * PUT /attributes/updateAttributes/{sellerId}
 * Web uses a double slash (`//`) — corrected to a single slash here.
 */
export async function updateSellerAttribute(
  sellerId: string,
  payload: UpdateSellerAttributePayload,
): Promise<void> {
  await apiPut<void>(
    `/attributes/updateAttributes/${encodeURIComponent(sellerId)}`,
    payload,
    undefined,
    'Failed to update attribute',
  );
}

/** DELETE /attributes/delete/{sellerId} */
export async function deleteSellerAttribute(
  sellerId: string,
  payload: DeleteSellerAttributePayload,
): Promise<void> {
  await apiDelete<void>(
    `/attributes/delete/${encodeURIComponent(sellerId)}`,
    { data: payload },
    'Failed to delete attribute',
  );
}
