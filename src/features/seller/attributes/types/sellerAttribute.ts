export interface SellerAttributeDocument {
  _id?: string;
  attributes?: string[];
}

export type SellerAttributesListResponse = SellerAttributeDocument[];

export interface AddSellerAttributePayload {
  attributes: string;
}

export interface UpdateSellerAttributePayload {
  updatedAttributeValue: string;
  indexToUpdate: number;
}

export interface DeleteSellerAttributePayload {
  attributes: string;
}

export interface SellerAttributeListItem {
  name: string;
  index: number;
}
