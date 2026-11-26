import { ValidationError } from '@shared/models/errors/validation.error';
import { DiscountPeriodDraft, createDiscountPeriodDraft } from './discount-period-draft';
import { isBasePeriod } from './discount-period';

const yearly: DiscountPeriodDraft = {
  months: 12,
  standardPercent: 20,
  vipPercent: 0,
  appliesTimer: false,
  appliesCampaign: false,
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

describe('createDiscountPeriodDraft', () => {
  it('should accept a year with its own discount', () => {
    expect(createDiscountPeriodDraft(yearly)).toEqual(yearly);
  });

  it('should accept a period that only takes the timer', () => {
    expect(
      codesOf(() =>
        createDiscountPeriodDraft({ ...yearly, standardPercent: 0, appliesTimer: true }),
      ),
    ).toEqual([]);
  });

  it('should reject a period with its own discount and a promotion', () => {
    expect(codesOf(() => createDiscountPeriodDraft({ ...yearly, appliesCampaign: true }))).toEqual([
      'Discount.WithPromotions',
    ]);
  });

  it('should reject months outside 1 to 36', () => {
    expect(codesOf(() => createDiscountPeriodDraft({ ...yearly, months: 0 }))).toEqual([
      'Months.Invalid',
    ]);
    expect(codesOf(() => createDiscountPeriodDraft({ ...yearly, months: 37 }))).toEqual([
      'Months.Invalid',
    ]);
  });

  it('should reject an empty coach list', () => {
    expect(codesOf(() => createDiscountPeriodDraft({ ...yearly, trainerIds: [] }))).toEqual([
      'TrainerIds.Empty',
    ]);
  });
});

describe('isBasePeriod', () => {
  it('should be true only for one month for all coaches', () => {
    expect(isBasePeriod({ months: 1, trainerIds: null })).toBe(true);
    expect(isBasePeriod({ months: 1, trainerIds: ['t1'] })).toBe(false);
    expect(isBasePeriod({ months: 12, trainerIds: null })).toBe(false);
  });
});
