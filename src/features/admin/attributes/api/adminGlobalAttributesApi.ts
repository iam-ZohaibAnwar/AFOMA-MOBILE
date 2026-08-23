import { apiDelete, apiGet, apiPut } from '../../../../services/api/request';
import type {
  AddGlobalAttributePayload,
  DeleteGlobalAttributePayload,
  DeleteGlobalAttributeResponse,
  GlobalAttributeDocument,
  GlobalAttributeListResponse,
  RenameGlobalAttributePayload,
  RenameGlobalAttributeResponse,
} from '../types/adminGlobalAttributes';
import { getSingletonGlobalAttributeDocument } from '../utils/adminGlobalAttributesContent';

/** GET /global-attribute — returns the raw singleton list response. */
export async function getGlobalAttributeList(): Promise<GlobalAttributeListResponse> {
  return apiGet<GlobalAttributeListResponse>(
    '/global-attribute',
    undefined,
    'Failed to load global attributes',
  );
}

/** GET /global-attribute — singleton document or null when absent. */
export async function getGlobalAttributeDocument(): Promise<GlobalAttributeDocument | null> {
  const response = await getGlobalAttributeList();
  return getSingletonGlobalAttributeDocument(response);
}

async function reconcileGlobalAttributeDocument(): Promise<GlobalAttributeDocument | null> {
  return getGlobalAttributeDocument();
}

/**
 * PUT /global-attribute/add/{documentId}
 * Body: { attributes: name }
 * Prepends to the platform list — then reconciles via GET.
 */
export async function addGlobalAttributeName(
  documentId: string,
  attributeName: string,
): Promise<GlobalAttributeDocument | null> {
  const payload: AddGlobalAttributePayload = { attributes: attributeName };

  await apiPut<GlobalAttributeDocument>(
    `/global-attribute/add/${encodeURIComponent(documentId)}`,
    payload,
    undefined,
    'Failed to add global attribute',
  );

  return reconcileGlobalAttributeDocument();
}

/**
 * PUT /global-attribute/{documentId}
 * Body: { updatedAttributeValue, indexToUpdate } — index is into the raw attributes[] array.
 */
export async function renameGlobalAttributeAtIndex(
  documentId: string,
  rawIndex: number,
  updatedAttributeValue: string,
): Promise<GlobalAttributeDocument | null> {
  const payload: RenameGlobalAttributePayload = {
    updatedAttributeValue,
    indexToUpdate: rawIndex,
  };

  await apiPut<RenameGlobalAttributeResponse>(
    `/global-attribute/${encodeURIComponent(documentId)}`,
    payload,
    undefined,
    'Failed to rename global attribute',
  );

  return reconcileGlobalAttributeDocument();
}

/**
 * DELETE /global-attribute/one/{documentId}
 * Body: { attributes: name } — then reconciles via GET (required).
 */
export async function deleteGlobalAttributeName(
  documentId: string,
  attributeName: string,
): Promise<GlobalAttributeDocument | null> {
  const payload: DeleteGlobalAttributePayload = { attributes: attributeName };

  await apiDelete<DeleteGlobalAttributeResponse>(
    `/global-attribute/one/${encodeURIComponent(documentId)}`,
    { data: payload },
    'Failed to delete global attribute',
  );

  return reconcileGlobalAttributeDocument();
}
