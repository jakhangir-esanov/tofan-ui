import { ValidationError } from '@shared/models/errors/validation.error';
import { isUuid } from '@shared/utils/identifiers';

export interface TrainerDraft {
  readonly userId: string;
  readonly displayName: string;
}

export function createTrainerDraft(draft: TrainerDraft): TrainerDraft {
  const userId = draft.userId.trim();
  const displayName = draft.displayName.trim();
  if (!isUuid(userId)) {
    throw new ValidationError('The user id is not a UUID.', [
      { code: 'UserId.Invalid', message: 'The user id must be a UUID.' },
    ]);
  }
  if (displayName.length === 0) {
    throw new ValidationError('The display name is empty.', [
      { code: 'Trainer.DisplayNameEmpty', message: 'The display name is required.' },
    ]);
  }
  return { userId, displayName };
}
