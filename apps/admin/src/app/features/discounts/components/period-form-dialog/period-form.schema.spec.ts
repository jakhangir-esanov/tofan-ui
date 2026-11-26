import { DiscountPeriod } from '../../models/discount-period';
import { emptyPeriodFormValue, periodFormValue, toPeriodDraft } from './period-form.schema';

const yearly: DiscountPeriod = {
  id: 'p12',
  months: 12,
  standardPercent: 20,
  vipPercent: 30,
  appliesTimer: false,
  appliesCampaign: false,
  trainerIds: ['t1'],
};

const quarterly: DiscountPeriod = {
  id: 'p3',
  months: 3,
  standardPercent: 0,
  vipPercent: 0,
  appliesTimer: true,
  appliesCampaign: false,
  trainerIds: null,
};

describe('period form', () => {
  it('should not build a draft when the months are missing', () => {
    expect(toPeriodDraft(emptyPeriodFormValue(), true, true)).toBeNull();
  });

  it('should open a period with promotions in the promotions mode', () => {
    expect(periodFormValue(quarterly).mode).toBe('promotions');
    expect(periodFormValue(yearly).mode).toBe('own');
  });

  it('should drop the promotions when the own discount is chosen', () => {
    const value = { ...periodFormValue(yearly), appliesTimer: true, appliesCampaign: true };

    const draft = toPeriodDraft(value, true, true);

    expect(draft).toEqual({
      months: 12,
      standardPercent: 20,
      vipPercent: 30,
      appliesTimer: false,
      appliesCampaign: false,
      trainerIds: ['t1'],
    });
  });

  it('should drop the percents when the promotions are chosen', () => {
    const value = { ...periodFormValue(quarterly), standardPercent: 15 };

    expect(toPeriodDraft(value, false, true)).toEqual({
      months: 3,
      standardPercent: 0,
      vipPercent: 0,
      appliesTimer: true,
      appliesCampaign: false,
      trainerIds: null,
    });
  });

  it('should send a zero VIP percent when the page offers no VIP', () => {
    expect(toPeriodDraft(periodFormValue(yearly), false, false)?.vipPercent).toBe(0);
  });
});
