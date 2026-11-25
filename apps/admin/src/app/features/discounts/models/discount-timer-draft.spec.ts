import { ValidationError } from '@shared/models/errors/validation.error';
import { DiscountTimerDraft, createDiscountTimerDraft } from './discount-timer-draft';

const draft: DiscountTimerDraft = {
  isEnabled: true,
  trigger: 'eachTrainer',
  startsOnVisit: 1,
  durationMinutes: 10,
  standardPercent: 10,
  vipPercent: 10,
  newBuyersOnly: true,
  trainerIds: null,
};

function codesOf(action: () => unknown): readonly string[] {
  try {
    action();
    return [];
  } catch (error) {
    return error instanceof ValidationError ? error.issues.map((issue) => issue.code) : [];
  }
}

describe('createDiscountTimerDraft', () => {
  it('should keep the timer when it is valid', () => {
    expect(createDiscountTimerDraft(draft)).toEqual(draft);
  });

  it('should allow zero percents when the timer is turned off', () => {
    const off = { ...draft, isEnabled: false, standardPercent: 0, vipPercent: 0 };

    expect(createDiscountTimerDraft(off)).toEqual(off);
  });

  it('should reject zero percents when the timer is turned on', () => {
    expect(
      codesOf(() => createDiscountTimerDraft({ ...draft, standardPercent: 0, vipPercent: 0 })),
    ).toEqual(['Discount.Empty']);
  });

  it('should reject the timer when the visit and the duration are out of range', () => {
    expect(
      codesOf(() =>
        createDiscountTimerDraft({ ...draft, startsOnVisit: 0, durationMinutes: 10081 }),
      ),
    ).toEqual(['StartsOnVisit.Invalid', 'DurationMinutes.Invalid']);
  });
});
