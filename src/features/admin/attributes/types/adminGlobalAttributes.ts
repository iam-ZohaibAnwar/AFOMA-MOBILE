/** Singleton platform global-attribute document from GET /global-attribute. */
export interface GlobalAttributeDocument {
  _id: string;
  attributes?: (string | null)[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type GlobalAttributeListResponse = GlobalAttributeDocument[];

/** PUT /global-attribute/add/{documentId} */
export interface AddGlobalAttributePayload {
  attributes: string;
}

/** PUT /global-attribute/{documentId} */
export interface RenameGlobalAttributePayload {
  updatedAttributeValue: string;
  indexToUpdate: number;
}

/** DELETE /global-attribute/one/{documentId} */
export interface DeleteGlobalAttributePayload {
  attributes: string;
}

/** PUT /global-attribute/{documentId} success body. */
export interface RenameGlobalAttributeResponse {
  message?: string;
  updatedAttribute?: GlobalAttributeDocument;
}

/** DELETE /global-attribute/one/{documentId} success body. */
export interface DeleteGlobalAttributeResponse {
  message?: string;
}

/** Parsed list item preserving backend array index for rename mutations. */
export interface GlobalAttributeEntry {
  name: string;
  rawIndex: number;
}
