import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { DiscountsStore } from './discounts.store';
import { DiscountCampaign } from './models/discount-campaign';
import { DiscountCampaignDraft } from './models/discount-campaign-draft';
import { DiscountPeriod } from './models/discount-period';
import { DiscountPeriodDraft } from './models/discount-period-draft';
import { DiscountTimer } from './models/discount-timer';
import { DISCOUNT_API, DiscountApi } from './services/discount-api';

const campaign: DiscountCampaign = {
  id: 'c1',
  name: "Navro'z",
  startsOn: new Date('2027-03-19T19:00:00Z'),
  endsOn: new Date('2027-03-23T19:00:00Z'),
  standardPercent: 20,
  vipPercent: 0,
  newBuyersOnly: false,
  trainerIds: null,
  isRunning: false,
};

const timer: DiscountTimer = {
  isEnabled: false,
  trigger: 'eachTrainer',
  startsOnVisit: 1,
  durationMinutes: 10,
  standardPercent: 10,
  vipPercent: 10,
  newBuyersOnly: false,
  trainerIds: null,
};

const draft: DiscountCampaignDraft = {
  name: "Navro'z",
  startsOn: campaign.startsOn,
  endsOn: campaign.endsOn,
  standardPercent: 20,
  vipPercent: 0,
  newBuyersOnly: false,
  trainerIds: null,
};

const yearly: DiscountPeriod = {
  id: 'p12',
  months: 12,
  standardPercent: 20,
  vipPercent: 0,
  appliesTimer: false,
  appliesCampaign: false,
  trainerIds: null,
};

const yearlyDraft: DiscountPeriodDraft = {
  months: 12,
  standardPercent: 20,
  vipPercent: 0,
  appliesTimer: false,
  appliesCampaign: false,
  trainerIds: null,
};

describe('DiscountsStore', () => {
  let api: DiscountApi;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): DiscountsStore {
    TestBed.configureTestingModule({
      providers: [
        DiscountsStore,
        { provide: DISCOUNT_API, useValue: api },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(DiscountsStore);
  }

  beforeEach(() => {
    api = {
      listCampaigns: vi.fn().mockResolvedValue([campaign]),
      createCampaign: vi.fn().mockResolvedValue(undefined),
      changeCampaign: vi.fn().mockResolvedValue(undefined),
      removeCampaign: vi.fn().mockResolvedValue(undefined),
      getTimer: vi.fn().mockResolvedValue(timer),
      changeTimer: vi.fn().mockResolvedValue(undefined),
      listPeriods: vi.fn().mockResolvedValue([yearly]),
      createPeriod: vi.fn().mockResolvedValue(undefined),
      changePeriod: vi.fn().mockResolvedValue(undefined),
      removePeriod: vi.fn().mockResolvedValue(undefined),
      listTrainers: vi.fn().mockResolvedValue([{ id: 't1', displayName: 'Aziz' }]),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should hold the campaigns, the timer and the coaches when they load', async () => {
    const store = createStore();

    await store.load();

    expect(store.campaigns()).toEqual([campaign]);
    expect(store.timer()).toEqual(timer);
    expect(store.periods()).toEqual([yearly]);
    expect(store.trainers()).toEqual([{ id: 't1', displayName: 'Aziz' }]);
    expect(store.loadError()).toBeNull();
  });

  it('should clear the screen and keep the error when loading fails', async () => {
    api.getTimer = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    await store.load();

    expect(store.campaigns()).toEqual([]);
    expect(store.timer()).toBeNull();
    expect(store.loadError()).not.toBeNull();
  });

  it('should create the campaign, toast and reload when a new campaign is saved', async () => {
    const store = createStore();

    const saved = await store.createCampaign(draft);

    expect(saved).toBe(true);
    expect(api.createCampaign).toHaveBeenCalledWith(draft);
    expect(notifications.success).toHaveBeenCalledWith('discounts.toast.campaignCreated');
    expect(api.listCampaigns).toHaveBeenCalled();
  });

  it('should not call the backend and report the error when the campaign is invalid', async () => {
    const store = createStore();

    const saved = await store.changeCampaign('c1', { ...draft, standardPercent: 0 });

    expect(saved).toBe(false);
    expect(api.changeCampaign).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should remove the campaign by its id when it is deleted', async () => {
    const store = createStore();

    await store.removeCampaign(campaign);

    expect(api.removeCampaign).toHaveBeenCalledWith('c1');
    expect(notifications.success).toHaveBeenCalledWith('discounts.toast.campaignRemoved');
  });

  it('should save the timer when its settings are valid', async () => {
    const store = createStore();

    const saved = await store.saveTimer({ ...timer, isEnabled: true });

    expect(saved).toBe(true);
    expect(api.changeTimer).toHaveBeenCalledWith({ ...timer, isEnabled: true });
    expect(notifications.success).toHaveBeenCalledWith('discounts.toast.timerSaved');
  });

  it('should create the period, toast and reload when a new period is saved', async () => {
    const store = createStore();
    const saved = await store.createPeriod(yearlyDraft);

    expect(saved).toBe(true);
    expect(api.createPeriod).toHaveBeenCalledWith(yearlyDraft);
    expect(notifications.success).toHaveBeenCalledWith('discounts.toast.periodCreated');
  });

  it('should not call the backend when a period mixes its own discount and a promotion', async () => {
    const store = createStore();
    const saved = await store.changePeriod('p12', { ...yearlyDraft, appliesTimer: true });

    expect(saved).toBe(false);
    expect(api.changePeriod).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should remove the period by its id when it is deleted', async () => {
    const store = createStore();

    await store.removePeriod(yearly);

    expect(api.removePeriod).toHaveBeenCalledWith('p12');
    expect(notifications.success).toHaveBeenCalledWith('discounts.toast.periodRemoved');
  });
});
