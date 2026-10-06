import { ValidationError } from '@shared/models/errors/validation.error';
import { TrainerDraft, createTrainerDraft } from './trainer-draft';

const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

const draft: TrainerDraft = { userId: USER_ID, displayName: 'Jasur Karimov' };

function issueCodes(invalid: TrainerDraft): string[] {
  try {
    createTrainerDraft(invalid);
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createTrainerDraft', () => {
  it('should trim both fields when the user typed them loosely', () => {
    const prepared = createTrainerDraft({ userId: ` ${USER_ID} `, displayName: '  Jasur  ' });

    expect(prepared).toEqual({ userId: USER_ID, displayName: 'Jasur' });
  });

  it('should refuse the draft when the user id is not a UUID', () => {
    expect(issueCodes({ ...draft, userId: 'not-a-uuid' })).toEqual(['UserId.Invalid']);
  });

  it('should refuse the draft when the user id is empty', () => {
    expect(issueCodes({ ...draft, userId: '  ' })).toEqual(['UserId.Invalid']);
  });

  it('should refuse the draft when the display name is blank', () => {
    expect(issueCodes({ ...draft, displayName: '   ' })).toEqual(['Trainer.DisplayNameEmpty']);
  });
});
