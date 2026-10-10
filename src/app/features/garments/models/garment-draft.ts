import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { isAfterDay, startOfDay } from '@shared/utils/calendar-date';
import { GarmentSize } from './garment-catalog';

export const GARMENT_TEXT_MAX_LENGTH = 200;

export interface GarmentDraft {
  readonly dropId: string;
  readonly variantId: string;
  readonly size: GarmentSize;
  readonly material: string;
  readonly manufacturedAt: Date;
}

export function latestManufacturingDay(now: Date): Date {
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function createGarmentDraft(draft: GarmentDraft, now: Date): GarmentDraft {
  const prepared: GarmentDraft = {
    ...draft,
    material: draft.material.trim(),
    manufacturedAt: startOfDay(draft.manufacturedAt),
  };

  const issues = [...missingFields(prepared), ...tooLongFields(prepared)];
  if (isAfterDay(prepared.manufacturedAt, latestManufacturingDay(now))) {
    issues.push({
      code: 'Garment.ManufacturedInFuture',
      message: 'The manufacturing date cannot be in the future.',
    });
  }
  if (issues.length > 0) {
    throw new ValidationError('The garment is not valid.', issues);
  }
  return prepared;
}

function missingFields(draft: GarmentDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (draft.dropId.length === 0) {
    issues.push({ code: 'Drop.Empty', message: 'Drop is required.' });
  }
  if (draft.variantId.length === 0) {
    issues.push({ code: 'Variant.Empty', message: 'Variant is required.' });
  }
  return issues;
}

function tooLongFields(draft: GarmentDraft): ValidationIssue[] {
  return draft.material.length > GARMENT_TEXT_MAX_LENGTH
    ? [
        {
          code: 'Material.TooLong',
          message: `Material must be at most ${GARMENT_TEXT_MAX_LENGTH} characters.`,
        },
      ]
    : [];
}
