import { Drop, DropVariant } from '../models/drop';
import { DropDraft, DropVariantDraft } from '../models/drop-draft';
import {
  AddDropVariantRequest,
  CreateDropRequest,
  DropResponse,
  DropVariantResponse,
} from './drop.dto';

export type ImageUrlOf = (fileId: string) => string;

export function toDrop(response: DropResponse, imageUrlOf: ImageUrlOf): Drop {
  return new Drop(
    response.id,
    response.name,
    response.totalQuantity,
    response.issuedCount,
    new Date(response.createdOnUtc),
    response.variants.map((variant) => toDropVariant(variant, imageUrlOf)),
  );
}

export function toCreateDropRequest(draft: DropDraft): CreateDropRequest {
  return { name: draft.name, totalQuantity: draft.totalQuantity };
}

export function toAddDropVariantRequest(draft: DropVariantDraft): AddDropVariantRequest {
  return { name: draft.name, color: draft.color, imageFileId: draft.imageFileId };
}

function toDropVariant(response: DropVariantResponse, imageUrlOf: ImageUrlOf): DropVariant {
  return {
    id: response.id,
    name: response.name,
    color: response.color,
    imageUrl:
      response.imageFileId === null || response.imageFileId === undefined
        ? null
        : imageUrlOf(response.imageFileId),
  };
}
