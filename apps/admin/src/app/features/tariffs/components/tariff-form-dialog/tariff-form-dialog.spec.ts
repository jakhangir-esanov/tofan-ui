import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tariff } from '../../models/tariff';
import { TariffDraft } from '../../models/tariff-draft';
import { TariffFormDialog } from './tariff-form-dialog';

const limited: Tariff = {
  id: 't2',
  type: 'standard',
  monthlyPrice: 49000,
  totalPrice: 99000,
  foodScanLimit: 15,
  workoutVideoLimit: 30,
  dietMealTypes: ['lunch'],
  workoutChangeMonths: 3,
  dietChangeDays: 7,
  hasAiTrainerChat: true,
  benefits: [],
};

const open: Tariff = {
  ...limited,
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
};

interface Rendered {
  readonly fixture: ComponentFixture<TariffFormDialog>;
  readonly saved: TariffDraft[];
}

async function render(tariff: Tariff): Promise<Rendered> {
  const fixture = TestBed.createComponent(TariffFormDialog);
  const saved: TariffDraft[] = [];
  fixture.componentInstance.save.subscribe((draft) => saved.push(draft));
  fixture.componentRef.setInput('tariff', tariff);
  fixture.componentRef.setInput('visible', true);
  await settle(fixture);
  return { fixture, saved };
}

async function settle(fixture: ComponentFixture<TariffFormDialog>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function input(id: string): HTMLInputElement {
  const found = document.querySelector<HTMLInputElement>(`#${id}`);
  if (found === null) {
    throw new Error(`The input ${id} is missing.`);
  }
  return found;
}

async function toggle(fixture: ComponentFixture<TariffFormDialog>, id: string): Promise<void> {
  input(id).click();
  await settle(fixture);
}

async function type(
  fixture: ComponentFixture<TariffFormDialog>,
  id: string,
  text: string,
): Promise<void> {
  const field = input(id);
  field.value = text;
  field.dispatchEvent(new Event('input'));
  field.dispatchEvent(new Event('blur'));
  await settle(fixture);
}

async function press(fixture: ComponentFixture<TariffFormDialog>, label: string): Promise<void> {
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  button?.click();
  await settle(fixture);
}

describe('TariffFormDialog', () => {
  afterEach(() => document.body.replaceChildren());

  it('should fill the fields from the tariff when the dialog opens', async () => {
    await render(limited);

    expect(input('tariffPrice').value).toMatch(/49.?000/);
    expect(input('tariffFoodScanLimit').value).toBe('15');
    expect(input('tariffFoodScanUnlimited').checked).toBe(false);
  });

  it('should disable the number field when the unlimited toggle is on', async () => {
    await render(open);

    expect(input('tariffFoodScanUnlimited').checked).toBe(true);
    expect(input('tariffFoodScanLimit').disabled).toBe(true);
    expect(input('tariffWorkoutVideoLimit').disabled).toBe(true);
    expect(input('tariffWorkoutChangeMonths').disabled).toBe(true);
    expect(input('tariffDietChangeDays').disabled).toBe(true);
  });

  it('should enable the number field when the toggle is switched off', async () => {
    const { fixture } = await render(open);

    await toggle(fixture, 'tariffFoodScanUnlimited');

    expect(input('tariffFoodScanLimit').disabled).toBe(false);
  });

  it('should disable the meal type select when all meals are open', async () => {
    const { fixture } = await render(open);

    expect(input('tariffMealTypes').disabled).toBe(true);

    await toggle(fixture, 'tariffAllMealTypes');

    expect(input('tariffMealTypes').disabled).toBe(false);
  });

  it('should not emit and ask for a meal type when the all-meals toggle is switched off', async () => {
    const { fixture, saved } = await render(open);

    await toggle(fixture, 'tariffAllMealTypes');
    await press(fixture, 'Saqlash');

    expect(saved).toEqual([]);
    expect(document.body.textContent).toContain('Kamida bitta ovqat turini tanlang.');
  });

  it('should emit the numbers when every toggle is off and the tariff is saved', async () => {
    const { fixture, saved } = await render(limited);

    await press(fixture, 'Saqlash');

    expect(saved).toEqual([
      {
        monthlyPrice: 49000,
        foodScanLimit: 15,
        workoutVideoLimit: 30,
        dietMealTypes: ['lunch'],
        workoutChangeMonths: 3,
        dietChangeDays: 7,
        hasAiTrainerChat: true,
      },
    ]);
  });

  it('should emit null for every limit when every toggle is on and the tariff is saved', async () => {
    const { fixture, saved } = await render(open);

    await press(fixture, 'Saqlash');

    expect(saved).toEqual([
      {
        monthlyPrice: 49000,
        foodScanLimit: null,
        workoutVideoLimit: null,
        dietMealTypes: null,
        workoutChangeMonths: null,
        dietChangeDays: null,
        hasAiTrainerChat: true,
      },
    ]);
  });

  it('should emit null and not the typed number when the toggle is switched back on', async () => {
    const { fixture, saved } = await render(limited);

    await toggle(fixture, 'tariffFoodScanUnlimited');
    await press(fixture, 'Saqlash');

    expect(saved[0]?.foodScanLimit).toBeNull();
    expect(saved[0]?.workoutVideoLimit).toBe(30);
  });

  it('should not emit and show the error when a switched-off limit is cleared', async () => {
    const { fixture, saved } = await render(limited);

    await type(fixture, 'tariffFoodScanLimit', '');
    await press(fixture, 'Saqlash');

    expect(saved).toEqual([]);
    expect(document.body.textContent).toContain('0 yoki undan katta butun son kiriting.');
  });

  it('should emit zero when the scan limit is zero', async () => {
    const { fixture, saved } = await render(limited);

    await type(fixture, 'tariffFoodScanLimit', '0');
    await press(fixture, 'Saqlash');

    expect(saved[0]?.foodScanLimit).toBe(0);
  });

  it('should lock the price at zero when the tariff is Free', async () => {
    const free: Tariff = { ...open, id: 't1', type: 'free', monthlyPrice: 0, totalPrice: 0 };
    const { fixture, saved } = await render(free);

    expect(input('tariffPrice').disabled).toBe(true);
    expect(document.body.textContent).toContain('Free doim bepul');

    await press(fixture, 'Saqlash');

    expect(saved[0]?.monthlyPrice).toBe(0);
  });

  it('should refuse a zero price when the tariff is Standard', async () => {
    const { fixture, saved } = await render(limited);

    await type(fixture, 'tariffPrice', '0');
    await press(fixture, 'Saqlash');

    expect(saved).toEqual([]);
    expect(document.body.textContent).toContain("Narx 0 dan katta bo'lishi kerak.");
  });
});
