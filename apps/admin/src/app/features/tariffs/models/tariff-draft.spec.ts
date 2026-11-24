import { ValidationError } from '@shared/models/errors/validation.error';
import { TariffDraft, createTariffDraft } from './tariff-draft';

const draft: TariffDraft = {
  monthlyPrice: 49000,
  foodScanLimit: 15,
  workoutVideoLimit: 30,
  dietMealTypes: ['lunch'],
  workoutChangeMonths: 3,
  dietChangeDays: 7,
  hasAiTrainerChat: true,
};

function issueCodes(action: () => unknown): string[] {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return (error as ValidationError).issues.map((issue) => issue.code);
  }
  throw new Error('The draft was accepted.');
}

describe('createTariffDraft', () => {
  it('should keep the draft when a paid tariff is valid', () => {
    expect(createTariffDraft('standard', draft)).toEqual(draft);
  });

  it('should keep the draft when every limit is switched off', () => {
    const open: TariffDraft = {
      ...draft,
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
    };

    expect(createTariffDraft('vip', open)).toEqual(open);
  });

  it('should allow a zero scan limit when scanning is closed', () => {
    expect(createTariffDraft('standard', { ...draft, foodScanLimit: 0 }).foodScanLimit).toBe(0);
  });

  it('should accept a zero price when the tariff is Free', () => {
    expect(createTariffDraft('free', { ...draft, monthlyPrice: 0 }).monthlyPrice).toBe(0);
  });

  it('should refuse a price when the tariff is Free', () => {
    expect(issueCodes(() => createTariffDraft('free', draft))).toEqual(['Tariff.FreeMustStayFree']);
  });

  it('should refuse a zero price when the tariff is paid', () => {
    expect(issueCodes(() => createTariffDraft('standard', { ...draft, monthlyPrice: 0 }))).toEqual([
      'Tariff.PaidPriceRequired',
    ]);
    expect(issueCodes(() => createTariffDraft('vip', { ...draft, monthlyPrice: -1 }))).toEqual([
      'Tariff.PaidPriceRequired',
    ]);
  });

  it('should refuse an empty meal type list when the meal types are limited', () => {
    expect(
      issueCodes(() => createTariffDraft('standard', { ...draft, dietMealTypes: [] })),
    ).toEqual(['DietMealTypes.Empty']);
  });

  it('should refuse limits below their minimum when the numbers are out of range', () => {
    expect(
      issueCodes(() =>
        createTariffDraft('standard', {
          ...draft,
          foodScanLimit: -1,
          workoutVideoLimit: -1,
          workoutChangeMonths: 0,
          dietChangeDays: 0,
        }),
      ),
    ).toEqual([
      'FoodScanLimit.Invalid',
      'WorkoutVideoLimit.Invalid',
      'WorkoutChangeMonths.Invalid',
      'DietChangeDays.Invalid',
    ]);
  });

  it('should refuse a fractional limit when the number is not whole', () => {
    expect(
      issueCodes(() => createTariffDraft('standard', { ...draft, foodScanLimit: 1.5 })),
    ).toEqual(['FoodScanLimit.Invalid']);
  });
});
