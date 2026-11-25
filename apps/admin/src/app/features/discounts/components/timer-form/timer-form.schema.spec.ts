import { DiscountTimer } from '../../models/discount-timer';
import { timerFormValue, toTimerDraft } from './timer-form.schema';

const timer: DiscountTimer = {
  isEnabled: true,
  trigger: 'anyTrainer',
  startsOnVisit: 3,
  durationMinutes: 15,
  standardPercent: 10,
  vipPercent: 20,
  newBuyersOnly: true,
  trainerIds: ['t1', 't2'],
};

describe('timer form', () => {
  it('should give back the same timer when nothing was changed', () => {
    expect(toTimerDraft(timerFormValue(timer), true)).toEqual(timer);
  });

  it('should not build a draft when the duration is empty', () => {
    expect(toTimerDraft({ ...timerFormValue(timer), durationMinutes: null }, true)).toBeNull();
  });

  it('should send no coaches when the page is for Tofan tariffs', () => {
    expect(toTimerDraft(timerFormValue(timer), false)?.trainerIds).toBeNull();
  });
});
