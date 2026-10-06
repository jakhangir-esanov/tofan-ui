import { TranslationKey } from '@core/i18n/dictionary';
import { pattern, required, schema } from '@angular/forms/signals';
import { UUID_PATTERN } from '@shared/utils/identifiers';
import { TrainerDraft } from '../../models/trainer-draft';

const ERRORS = {
  userId: 'trainers.form.errors.userId',
  displayName: 'trainers.form.errors.displayName',
} as const satisfies Record<string, TranslationKey>;

const NON_BLANK_PATTERN = /\S/;

export interface TrainerFormValue {
  userId: string;
  displayName: string;
}

export function emptyTrainerFormValue(): TrainerFormValue {
  return { userId: '', displayName: '' };
}

export function toTrainerDraft(value: TrainerFormValue): TrainerDraft {
  return { userId: value.userId, displayName: value.displayName };
}

export const trainerFormSchema = schema<TrainerFormValue>((path) => {
  required(path.userId, { message: ERRORS.userId });
  pattern(path.userId, UUID_PATTERN, { message: ERRORS.userId });
  required(path.displayName, { message: ERRORS.displayName });
  pattern(path.displayName, NON_BLANK_PATTERN, { message: ERRORS.displayName });
});
