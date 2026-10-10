export interface DropVariantResponse {
  id: string;
  dropId: string;
  name: string;
  color: string;
  imageFileId: string | null;
}

export interface DropResponse {
  id: string;
  name: string;
  totalQuantity: number;
  issuedCount: number;
  createdOnUtc: string;
  variants: DropVariantResponse[];
}

export interface CreateDropRequest {
  name: string;
  totalQuantity: number;
}

export interface AddDropVariantRequest {
  name: string;
  color: string;
  imageFileId: string;
}
