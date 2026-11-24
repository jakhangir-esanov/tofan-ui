import { MealTypeDto } from '@shared/models/meal-type.dto';
import { TariffDraft } from '../models/tariff-draft';
import { TariffResponse, TariffType as ApiTariffType } from './tariff.dto';
import {
  tariffTypes,
  toChangeTariffBenefitsRequest,
  toChangeTariffRequest,
  toTariff,
  toTariffs,
} from './tariff.mapper';

function response(overrides: Partial<TariffResponse> = {}): TariffResponse {
  return {
    id: 't2',
    type: ApiTariffType.Standard,
    monthlyPrice: 49000,
    totalPrice: 99000,
    foodScanLimit: 15,
    workoutVideoLimit: 30,
    dietMealTypes: [MealTypeDto.Lunch, MealTypeDto.SecondBreakfast],
    workoutChangeMonths: 3,
    dietChangeDays: 7,
    hasAiTrainerChat: true,
    benefits: [{ name: 'Scan', nameRu: 'Скан', nameUz: 'Skan' }],
    ...overrides,
  };
}

describe('toTariff', () => {
  it('should map every field when the backend answers', () => {
    expect(toTariff(response())).toEqual({
      id: 't2',
      type: 'standard',
      monthlyPrice: 49000,
      totalPrice: 99000,
      foodScanLimit: 15,
      workoutVideoLimit: 30,
      dietMealTypes: ['lunch', 'secondBreakfast'],
      workoutChangeMonths: 3,
      dietChangeDays: 7,
      hasAiTrainerChat: true,
      benefits: [{ en: 'Scan', ru: 'Скан', uz: 'Skan' }],
    });
  });

  it('should keep null limits when the tariff has no limits', () => {
    const tariff = toTariff(
      response({
        foodScanLimit: null,
        workoutVideoLimit: null,
        dietMealTypes: null,
        workoutChangeMonths: null,
        dietChangeDays: null,
      }),
    );

    expect(tariff.foodScanLimit).toBeNull();
    expect(tariff.workoutVideoLimit).toBeNull();
    expect(tariff.dietMealTypes).toBeNull();
    expect(tariff.workoutChangeMonths).toBeNull();
    expect(tariff.dietChangeDays).toBeNull();
  });

  it('should keep a zero scan limit when scanning is closed', () => {
    expect(toTariff(response({ foodScanLimit: 0 })).foodScanLimit).toBe(0);
  });

  it('should map the VIP type when the backend sends 3', () => {
    expect(toTariff(response({ type: ApiTariffType.Vip })).type).toBe('vip');
  });
});

describe('toTariffs', () => {
  it('should order Free, Standard and VIP when the backend answers in another order', () => {
    const tariffs = toTariffs([
      response({ id: 'v', type: ApiTariffType.Vip }),
      response({ id: 'f', type: ApiTariffType.Free }),
      response({ id: 's', type: ApiTariffType.Standard }),
    ]);

    expect(tariffs.map((tariff) => tariff.type)).toEqual(['free', 'standard', 'vip']);
  });
});

describe('toChangeTariffRequest', () => {
  const draft: TariffDraft = {
    monthlyPrice: 49000,
    foodScanLimit: 15,
    workoutVideoLimit: 30,
    dietMealTypes: ['lunch', 'secondBreakfast'],
    workoutChangeMonths: 3,
    dietChangeDays: 7,
    hasAiTrainerChat: true,
  };

  it('should send all seven fields with the meal types as integers when mapping a draft', () => {
    expect(toChangeTariffRequest(draft)).toEqual({
      monthlyPrice: 49000,
      foodScanLimit: 15,
      workoutVideoLimit: 30,
      dietMealTypes: [MealTypeDto.Lunch, MealTypeDto.SecondBreakfast],
      workoutChangeMonths: 3,
      dietChangeDays: 7,
      hasAiTrainerChat: true,
    });
  });

  it('should keep every limit key as null when the limits are switched off', () => {
    const request = toChangeTariffRequest({
      ...draft,
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
    });

    expect(Object.keys(request).sort()).toEqual([
      'dietChangeDays',
      'dietMealTypes',
      'foodScanLimit',
      'hasAiTrainerChat',
      'monthlyPrice',
      'workoutChangeMonths',
      'workoutVideoLimit',
    ]);
    expect(request).toMatchObject({
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
    });
  });
});

describe('toChangeTariffBenefitsRequest', () => {
  it('should send the English text as name and keep the order when mapping benefits to the request', () => {
    const request = toChangeTariffBenefitsRequest([
      { en: 'B', ru: 'Б', uz: 'Bb' },
      { en: 'A', ru: 'А', uz: 'Aa' },
    ]);

    expect(request).toEqual({
      benefits: [
        { name: 'B', nameRu: 'Б', nameUz: 'Bb' },
        { name: 'A', nameRu: 'А', nameUz: 'Aa' },
      ],
    });
  });

  it('should send an empty list when no benefits are left', () => {
    expect(toChangeTariffBenefitsRequest([])).toEqual({ benefits: [] });
  });
});

describe('tariffTypes', () => {
  it('should map the domain types to 1, 2 and 3 when converting them to the API', () => {
    expect([
      tariffTypes.toApi('free'),
      tariffTypes.toApi('standard'),
      tariffTypes.toApi('vip'),
    ]).toEqual([1, 2, 3]);
  });
});
