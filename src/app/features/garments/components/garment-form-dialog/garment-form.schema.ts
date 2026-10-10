import { Signal } from '@angular/core';
import { TranslationKey } from '@core/i18n/dictionary';
import { Schema, maxDate, maxLength, required, schema } from '@angular/forms/signals';
import { Drop } from '../../models/drop';
import { GarmentSize } from '../../models/garment-catalog';
import { GARMENT_TEXT_MAX_LENGTH, GarmentDraft } from '../../models/garment-draft';

const ERRORS = {
  drop: 'garments.form.errors.drop',
  variant: 'garments.form.errors.variant',
  size: 'garments.form.errors.size',
  tooLong: 'garments.form.errors.tooLong',
  manufacturedAt: 'garments.form.errors.manufacturedAt',
  future: 'garments.form.errors.future',
} as const satisfies Record<string, TranslationKey>;

export interface GarmentFormValue {
  dropId: string | null;
  variantId: string | null;
  size: GarmentSize | null;
  material: string;
  manufacturedAt: Date | null;
}

export function emptyGarmentFormValue(latestDay: Date, dropId: string | null): GarmentFormValue {
  return {
    dropId,
    variantId: null,
    size: null,
    material: '',
    manufacturedAt: latestDay,
  };
}

export function toGarmentDraft(value: GarmentFormValue, drop: Drop | null): GarmentDraft | null {
  const { dropId, variantId, size, manufacturedAt } = value;
  if (dropId === null || variantId === null || size === null || manufacturedAt === null) {
    return null;
  }
  if (drop?.id !== dropId || drop.variant(variantId) === null) {
    return null;
  }
  return { dropId, variantId, size, material: value.material, manufacturedAt };
}

export function garmentFormSchema(latestDay: Signal<Date>): Schema<GarmentFormValue> {
  return schema<GarmentFormValue>((path) => {
    required(path.dropId, { message: ERRORS.drop });
    required(path.variantId, { message: ERRORS.variant });
    required(path.size, { message: ERRORS.size });
    maxLength(path.material, GARMENT_TEXT_MAX_LENGTH, { message: ERRORS.tooLong });
    required(path.manufacturedAt, { message: ERRORS.manufacturedAt });
    maxDate(path.manufacturedAt, () => latestDay(), { message: ERRORS.future });
  });
}
