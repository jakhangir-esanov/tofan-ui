import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { isHexColor } from '@shared/utils/hex-color';

export const DROP_TEXT_MAX_LENGTH = 200;
export const MIN_DROP_QUANTITY = 1;

export interface DropDraft {
  readonly name: string;
  readonly totalQuantity: number;
}

export interface DropVariantDraft {
  readonly name: string;
  readonly color: string;
  readonly imageFileId: string;
}

export function createDropDraft(draft: DropDraft): DropDraft {
  const prepared: DropDraft = { ...draft, name: draft.name.trim() };
  const issues: ValidationIssue[] = [...textIssues('Name', prepared.name)];
  if (!Number.isInteger(prepared.totalQuantity) || prepared.totalQuantity < MIN_DROP_QUANTITY) {
    issues.push({
      code: 'TotalQuantity.NotPositive',
      message: 'Total quantity must be a positive whole number.',
    });
  }
  return passOrThrow(prepared, issues, 'The drop is not valid.');
}

export function createDropVariantDraft(draft: DropVariantDraft): DropVariantDraft {
  const prepared: DropVariantDraft = {
    ...draft,
    name: draft.name.trim(),
    color: draft.color.trim().toUpperCase(),
  };
  const issues: ValidationIssue[] = [...textIssues('Name', prepared.name)];
  if (!isHexColor(prepared.color)) {
    issues.push({ code: 'Color.Format', message: 'Color must look like #RRGGBB.' });
  }
  if (prepared.imageFileId.length === 0) {
    issues.push({ code: 'Image.Empty', message: 'Image is required.' });
  }
  return passOrThrow(prepared, issues, 'The variant is not valid.');
}

function textIssues(field: string, value: string): ValidationIssue[] {
  if (value.length === 0) {
    return [{ code: `${field}.Empty`, message: `${field} is required.` }];
  }
  if (value.length > DROP_TEXT_MAX_LENGTH) {
    return [
      {
        code: `${field}.TooLong`,
        message: `${field} must be at most ${DROP_TEXT_MAX_LENGTH} characters.`,
      },
    ];
  }
  return [];
}

function passOrThrow<T>(prepared: T, issues: readonly ValidationIssue[], message: string): T {
  if (issues.length > 0) {
    throw new ValidationError(message, [...issues]);
  }
  return prepared;
}
