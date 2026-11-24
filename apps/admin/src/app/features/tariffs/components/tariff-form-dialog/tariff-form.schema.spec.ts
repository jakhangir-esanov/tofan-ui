import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { Tariff } from '../../models/tariff';
import { TariffType } from '../../models/tariff-type';
import {
  TariffFormValue,
  tariffFormSchema,
  tariffFormValue,
  toTariffDraft,
} from './tariff-form.schema';

const tariff: Tariff = {
  id: 't2',
  type: 'standard',
  monthlyPrice: 49000,
  totalPrice: 99000,
  foodScanLimit: 15,
  workoutVideoLimit: 30,
  dietMealTypes: ['lunch', 'dinner'],
  workoutChangeMonths: 3,
  dietChangeDays: 7,
  hasAiTrainerChat: true,
  benefits: [],
};

const open: Tariff = {
  ...tariff,
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
};

function formOf(value: TariffFormValue, type: TariffType = 'standard') {
  const model = signal(value);
  const fields = TestBed.runInInjectionContext(() =>
    form(
      model,
      tariffFormSchema(() => type),
    ),
  );
  return { model, fields };
}

describe('tariffFormValue', () => {
  it('should switch every toggle on when the tariff has no limits', () => {
    expect(tariffFormValue(open)).toEqual({
      monthlyPrice: 49000,
      foodScanUnlimited: true,
      foodScanLimit: null,
      workoutVideoUnlimited: true,
      workoutVideoLimit: null,
      allMealTypes: true,
      mealTypes: [],
      workoutNeverChanges: true,
      workoutChangeMonths: null,
      dietNeverChanges: true,
      dietChangeDays: null,
      hasAiTrainerChat: true,
    });
  });

  it('should switch the toggles off and keep the numbers when the tariff has limits', () => {
    expect(tariffFormValue(tariff)).toEqual({
      monthlyPrice: 49000,
      foodScanUnlimited: false,
      foodScanLimit: 15,
      workoutVideoUnlimited: false,
      workoutVideoLimit: 30,
      allMealTypes: false,
      mealTypes: ['lunch', 'dinner'],
      workoutNeverChanges: false,
      workoutChangeMonths: 3,
      dietNeverChanges: false,
      dietChangeDays: 7,
      hasAiTrainerChat: true,
    });
  });
});

describe('toTariffDraft', () => {
  it('should send the numbers when every toggle is off', () => {
    expect(toTariffDraft(tariffFormValue(tariff), 'standard')).toEqual({
      monthlyPrice: 49000,
      foodScanLimit: 15,
      workoutVideoLimit: 30,
      dietMealTypes: ['lunch', 'dinner'],
      workoutChangeMonths: 3,
      dietChangeDays: 7,
      hasAiTrainerChat: true,
    });
  });

  it('should send null for every limit when every toggle is on', () => {
    expect(toTariffDraft(tariffFormValue(open), 'standard')).toEqual({
      monthlyPrice: 49000,
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
      hasAiTrainerChat: true,
    });
  });

  it('should send null and not the typed number when the toggle is switched on', () => {
    const value: TariffFormValue = {
      ...tariffFormValue(tariff),
      foodScanUnlimited: true,
      foodScanLimit: 15,
      allMealTypes: true,
    };

    const draft = toTariffDraft(value, 'standard');

    expect(draft?.foodScanLimit).toBeNull();
    expect(draft?.dietMealTypes).toBeNull();
  });

  it('should send zero when scanning is closed', () => {
    const value: TariffFormValue = { ...tariffFormValue(tariff), foodScanLimit: 0 };

    expect(toTariffDraft(value, 'standard')?.foodScanLimit).toBe(0);
  });

  it('should order the meal types as the list shows them when they were picked in another order', () => {
    const value: TariffFormValue = {
      ...tariffFormValue(tariff),
      mealTypes: ['dinner', 'breakfast', 'lunch'],
    };

    expect(toTariffDraft(value, 'standard')?.dietMealTypes).toEqual([
      'breakfast',
      'lunch',
      'dinner',
    ]);
  });

  it('should build no draft when a toggle is off and its number is cleared', () => {
    const base = tariffFormValue(tariff);

    expect(toTariffDraft({ ...base, foodScanLimit: null }, 'standard')).toBeNull();
    expect(toTariffDraft({ ...base, workoutVideoLimit: null }, 'standard')).toBeNull();
    expect(toTariffDraft({ ...base, workoutChangeMonths: null }, 'standard')).toBeNull();
    expect(toTariffDraft({ ...base, dietChangeDays: null }, 'standard')).toBeNull();
  });

  it('should build no draft when the meal types are limited and none is chosen', () => {
    expect(toTariffDraft({ ...tariffFormValue(tariff), mealTypes: [] }, 'standard')).toBeNull();
  });

  it('should build no draft when a paid tariff has no price', () => {
    expect(toTariffDraft({ ...tariffFormValue(tariff), monthlyPrice: null }, 'vip')).toBeNull();
  });

  it('should send a zero price when the tariff is Free whatever the field holds', () => {
    const value: TariffFormValue = { ...tariffFormValue(open), monthlyPrice: 5000 };

    expect(toTariffDraft(value, 'free')?.monthlyPrice).toBe(0);
  });
});

describe('tariffFormSchema', () => {
  it('should be valid when every toggle is on and the numbers are empty', () => {
    const { fields } = formOf(tariffFormValue(open));

    expect(fields().valid()).toBe(true);
  });

  it('should disable the number field when its toggle is on', () => {
    const { fields } = formOf(tariffFormValue(open));

    expect(fields.foodScanLimit().disabled()).toBe(true);
    expect(fields.workoutVideoLimit().disabled()).toBe(true);
    expect(fields.mealTypes().disabled()).toBe(true);
    expect(fields.workoutChangeMonths().disabled()).toBe(true);
    expect(fields.dietChangeDays().disabled()).toBe(true);
  });

  it('should enable the number field when its toggle is switched off', () => {
    const { model, fields } = formOf(tariffFormValue(open));

    model.update((value) => ({ ...value, foodScanUnlimited: false }));

    expect(fields.foodScanLimit().disabled()).toBe(false);
    expect(fields.foodScanLimit().invalid()).toBe(true);
  });

  it('should require at least one meal type when the all-meals toggle is off', () => {
    const { model, fields } = formOf(tariffFormValue(open));

    model.update((value) => ({ ...value, allMealTypes: false }));
    expect(fields.mealTypes().invalid()).toBe(true);

    model.update((value) => ({ ...value, mealTypes: ['lunch'] }));
    expect(fields.mealTypes().invalid()).toBe(false);
  });

  it('should accept a zero scan limit and refuse a negative one when the limit is switched on', () => {
    const { model, fields } = formOf(tariffFormValue(tariff));

    model.update((value) => ({ ...value, foodScanLimit: 0 }));
    expect(fields.foodScanLimit().invalid()).toBe(false);

    model.update((value) => ({ ...value, foodScanLimit: -1 }));
    expect(fields.foodScanLimit().invalid()).toBe(true);
  });

  it('should refuse zero change months and zero change days when the toggles are off', () => {
    const { model, fields } = formOf(tariffFormValue(tariff));

    model.update((value) => ({ ...value, workoutChangeMonths: 0, dietChangeDays: 0 }));

    expect(fields.workoutChangeMonths().invalid()).toBe(true);
    expect(fields.dietChangeDays().invalid()).toBe(true);
  });

  it('should lock the price field when the tariff is Free', () => {
    const { fields } = formOf({ ...tariffFormValue(open), monthlyPrice: 0 }, 'free');

    expect(fields.monthlyPrice().disabled()).toBe(true);
    expect(fields().valid()).toBe(true);
  });

  it('should require a price above zero when the tariff is Standard or VIP', () => {
    const standard = formOf({ ...tariffFormValue(open), monthlyPrice: 0 }, 'standard');
    const vip = formOf({ ...tariffFormValue(open), monthlyPrice: null }, 'vip');
    const paid = formOf(tariffFormValue(open), 'vip');

    expect(standard.fields.monthlyPrice().invalid()).toBe(true);
    expect(vip.fields.monthlyPrice().invalid()).toBe(true);
    expect(paid.fields.monthlyPrice().invalid()).toBe(false);
    expect(paid.fields.monthlyPrice().disabled()).toBe(false);
  });
});
