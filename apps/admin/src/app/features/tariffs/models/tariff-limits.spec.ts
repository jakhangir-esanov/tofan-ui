import { Tariff } from './tariff';
import { TariffLimitLine, tariffLimitLines } from './tariff-limits';

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

function line(source: Tariff, label: TariffLimitLine['label']): TariffLimitLine {
  const found = tariffLimitLines(source).find((candidate) => candidate.label === label);
  if (found === undefined) {
    throw new Error(`The line ${label} is missing.`);
  }
  return found;
}

describe('tariffLimitLines', () => {
  it('should list the six rows in reading order when the tariff is shown', () => {
    expect(tariffLimitLines(tariff).map((row) => row.label)).toEqual([
      'tariffs.limits.foodScan.label',
      'tariffs.limits.workoutVideo.label',
      'tariffs.limits.mealTypes.label',
      'tariffs.limits.workoutChange.label',
      'tariffs.limits.dietChange.label',
      'tariffs.limits.aiChat.label',
    ]);
  });

  it('should count the scans per month when the scan limit is a number', () => {
    expect(line(tariff, 'tariffs.limits.foodScan.label')).toMatchObject({
      value: 'tariffs.limits.foodScan.some',
      params: { count: 15 },
    });
  });

  it('should say scan is closed when the scan limit is zero', () => {
    expect(line({ ...tariff, foodScanLimit: 0 }, 'tariffs.limits.foodScan.label').value).toBe(
      'tariffs.limits.foodScan.closed',
    );
  });

  it('should say unlimited when the scan limit is null', () => {
    expect(line({ ...tariff, foodScanLimit: null }, 'tariffs.limits.foodScan.label').value).toBe(
      'tariffs.limits.foodScan.unlimited',
    );
  });

  it('should say all videos are open when the video limit is null', () => {
    expect(
      line({ ...tariff, workoutVideoLimit: null }, 'tariffs.limits.workoutVideo.label').value,
    ).toBe('tariffs.limits.workoutVideo.unlimited');
  });

  it('should say all videos are closed when the video limit is zero', () => {
    expect(
      line({ ...tariff, workoutVideoLimit: 0 }, 'tariffs.limits.workoutVideo.label').value,
    ).toBe('tariffs.limits.workoutVideo.closed');
  });

  it('should count the open videos when the video limit is a number', () => {
    expect(line(tariff, 'tariffs.limits.workoutVideo.label')).toMatchObject({
      value: 'tariffs.limits.workoutVideo.some',
      params: { count: 30 },
    });
  });

  it('should say all meals are open when the meal types are null', () => {
    const row = line({ ...tariff, dietMealTypes: null }, 'tariffs.limits.mealTypes.label');

    expect(row.value).toBe('tariffs.limits.mealTypes.all');
    expect(row.mealTypes).toEqual([]);
  });

  it('should carry the chosen meal types when the meals are limited', () => {
    const row = line(tariff, 'tariffs.limits.mealTypes.label');

    expect(row.value).toBe('tariffs.limits.mealTypes.some');
    expect(row.mealTypes).toEqual(['lunch', 'dinner']);
  });

  it('should say never changes when the change limits are null', () => {
    const open: Tariff = { ...tariff, workoutChangeMonths: null, dietChangeDays: null };

    expect(line(open, 'tariffs.limits.workoutChange.label').value).toBe(
      'tariffs.limits.workoutChange.never',
    );
    expect(line(open, 'tariffs.limits.dietChange.label').value).toBe(
      'tariffs.limits.dietChange.never',
    );
  });

  it('should give the period when the change limits are numbers', () => {
    expect(line(tariff, 'tariffs.limits.workoutChange.label')).toMatchObject({
      value: 'tariffs.limits.workoutChange.every',
      params: { count: 3 },
    });
    expect(line(tariff, 'tariffs.limits.dietChange.label')).toMatchObject({
      value: 'tariffs.limits.dietChange.every',
      params: { count: 7 },
    });
  });

  it('should say whether the AI chat is included when the flag is set', () => {
    expect(line(tariff, 'tariffs.limits.aiChat.label').value).toBe(
      'tariffs.limits.aiChat.included',
    );
    expect(line({ ...tariff, hasAiTrainerChat: false }, 'tariffs.limits.aiChat.label').value).toBe(
      'tariffs.limits.aiChat.excluded',
    );
  });
});
