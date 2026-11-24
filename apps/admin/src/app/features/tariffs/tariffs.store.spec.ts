import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/feedback/notification.service';
import { Benefit } from '@shared/models/benefit';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError } from '@shared/models/errors/validation.error';
import { Tariff } from './models/tariff';
import { TariffDraft } from './models/tariff-draft';
import { TariffsService } from './services/tariffs.service';
import { TariffsStore } from './tariffs.store';

const standard: Tariff = {
  id: 't2',
  type: 'standard',
  monthlyPrice: 49000,
  totalPrice: 99000,
  foodScanLimit: 15,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: true,
  benefits: [],
};

const draft: TariffDraft = {
  monthlyPrice: 59000,
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: true,
};

const scan: Benefit = { en: 'Scan', ru: 'Скан', uz: 'Skan' };
const chat: Benefit = { en: 'AI chat', ru: 'ИИ чат', uz: 'AI chat' };

describe('TariffsStore', () => {
  let service: Pick<TariffsService, 'list' | 'change' | 'changeBenefits'>;
  let notifications: Pick<NotificationService, 'success' | 'error'>;

  function createStore(): TariffsStore {
    TestBed.configureTestingModule({
      providers: [
        TariffsStore,
        { provide: TariffsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(TariffsStore);
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue([standard]),
      change: vi.fn().mockResolvedValue(undefined),
      changeBenefits: vi.fn().mockResolvedValue(undefined),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  it('should expose the tariffs when the service answers', async () => {
    const store = createStore();

    await store.load();

    expect(store.tariffs()).toEqual([standard]);
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should keep the error and no tariffs when the service fails', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    await store.load();

    expect(store.tariffs()).toEqual([]);
    expect(store.loadError()).not.toBeNull();
  });

  it('should send the draft and reload the list when a tariff is saved', async () => {
    const saved: Tariff = { ...standard, monthlyPrice: 59000, totalPrice: 109000 };
    service.list = vi.fn().mockResolvedValue([saved]);
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(true);
    expect(service.change).toHaveBeenCalledWith('standard', draft);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.tariffs()).toEqual([saved]);
    expect(notifications.success).toHaveBeenCalledWith('tariffs.toast.saved');
    expect(store.saving()).toBe(false);
  });

  it('should not call the backend when a Free tariff carries a price', async () => {
    const store = createStore();

    const done = await store.change('free', draft);

    expect(done).toBe(false);
    expect(service.change).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(store.saving()).toBe(false);
  });

  it('should report the error and skip the reload when the backend refuses', async () => {
    const refusal = new BusinessRuleError('refused', 'Tariff.PaidPriceRequired');
    service.change = vi.fn().mockRejectedValue(refusal);
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(service.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should keep the saved result when the reload fails after a save', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    const done = await store.change('standard', draft);

    expect(done).toBe(true);
    expect(store.loadError()).not.toBeNull();
  });

  it('should send the whole ordered list and reload when the benefits are saved', async () => {
    const saved: Tariff = { ...standard, benefits: [chat, scan] };
    service.list = vi.fn().mockResolvedValue([saved]);
    const store = createStore();

    const done = await store.changeBenefits('standard', [chat, scan]);

    expect(done).toBe(true);
    expect(service.changeBenefits).toHaveBeenCalledWith('standard', [chat, scan]);
    expect(service.list).toHaveBeenCalledTimes(1);
    expect(store.tariffs()).toEqual([saved]);
    expect(notifications.success).toHaveBeenCalledWith('tariffs.toast.benefitsSaved');
    expect(store.saving()).toBe(false);
  });

  it('should be saving when the benefits write has not finished', async () => {
    let finish: () => void = () => undefined;
    service.changeBenefits = vi
      .fn()
      .mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const store = createStore();

    const saving = store.changeBenefits('vip', [scan]);

    expect(store.saving()).toBe(true);
    finish();
    await saving;
    expect(store.saving()).toBe(false);
  });

  it('should report the error and skip the reload when the benefits are refused', async () => {
    const refusal = new BusinessRuleError('refused', 'Tariff.NotFound');
    service.changeBenefits = vi.fn().mockRejectedValue(refusal);
    const store = createStore();

    const done = await store.changeBenefits('standard', [scan]);

    expect(done).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(refusal);
    expect(notifications.success).not.toHaveBeenCalled();
    expect(service.list).not.toHaveBeenCalled();
    expect(store.saving()).toBe(false);
  });

  it('should keep the saved result when the reload fails after the benefits are saved', async () => {
    service.list = vi.fn().mockRejectedValue(new ServiceUnavailableError('down'));
    const store = createStore();

    const done = await store.changeBenefits('standard', []);

    expect(done).toBe(true);
    expect(service.changeBenefits).toHaveBeenCalledWith('standard', []);
    expect(store.loadError()).not.toBeNull();
  });
});
