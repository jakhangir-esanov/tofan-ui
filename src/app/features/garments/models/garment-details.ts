import { TranslationKey } from '@core/i18n/dictionary';
import { Garment } from './garment';

export interface GarmentDetail {
  readonly label: TranslationKey;
  readonly value: string | Date | null;
  readonly code?: boolean;
  readonly swatch?: boolean;
}

export function garmentDetails(garment: Garment): readonly GarmentDetail[] {
  return [
    { label: 'garments.fields.serialNumber', value: garment.serialNumber, code: true },
    { label: 'garments.fields.token', value: garment.token, code: true },
    { label: 'garments.fields.drop', value: textOrNull(garment.dropName) },
    { label: 'garments.fields.edition', value: String(garment.editionNumber) },
    { label: 'garments.fields.variant', value: textOrNull(garment.variantName) },
    { label: 'garments.fields.color', value: textOrNull(garment.color), swatch: true },
    { label: 'garments.fields.size', value: textOrNull(garment.size) },
    { label: 'garments.fields.material', value: textOrNull(garment.material) },
    { label: 'garments.fields.manufacturedAt', value: garment.manufacturedAt },
    { label: 'garments.fields.activatedAt', value: garment.activatedAt },
    { label: 'garments.fields.expiresAt', value: garment.expiresAt },
    { label: 'garments.fields.ownerId', value: garment.ownerId, code: true },
    { label: 'garments.fields.id', value: garment.id, code: true },
  ];
}

function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
