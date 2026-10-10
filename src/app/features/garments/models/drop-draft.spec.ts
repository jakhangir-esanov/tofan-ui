import { ValidationError } from '@shared/models/errors/validation.error';
import { createDropDraft, createDropVariantDraft } from './drop-draft';

function issueCodes(action: () => unknown): string[] {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createDropDraft', () => {
  it('should trim the name when the drop is valid', () => {
    expect(createDropDraft({ name: ' Drop 1 ', totalQuantity: 500 }).name).toBe('Drop 1');
  });

  it('should name the blank name and the bad total when both are wrong', () => {
    expect(issueCodes(() => createDropDraft({ name: ' ', totalQuantity: 0 }))).toEqual([
      'Name.Empty',
      'TotalQuantity.NotPositive',
    ]);
  });

  it('should reject a fractional total when the quantity is not whole', () => {
    expect(issueCodes(() => createDropDraft({ name: 'Drop 1', totalQuantity: 2.5 }))).toEqual([
      'TotalQuantity.NotPositive',
    ]);
  });
});

describe('createDropVariantDraft', () => {
  it('should upper-case the colour code when the user typed it loosely', () => {
    const prepared = createDropVariantDraft({
      name: ' Oversize ',
      color: ' #a1b2c3 ',
      imageFileId: 'f1',
    });

    expect(prepared.name).toBe('Oversize');
    expect(prepared.color).toBe('#A1B2C3');
  });

  it('should name every problem when the variant is incomplete', () => {
    expect(
      issueCodes(() => createDropVariantDraft({ name: '', color: 'black', imageFileId: '' })),
    ).toEqual(['Name.Empty', 'Color.Format', 'Image.Empty']);
  });
});
