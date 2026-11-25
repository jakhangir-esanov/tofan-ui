import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { DiscountTimerDraft } from '../models/discount-timer-draft';
import { TariffDiscountsService } from './tariff-discounts.service';
import { TrainerDiscountsService } from './trainer-discounts.service';

const timerDraft: DiscountTimerDraft = {
  isEnabled: true,
  trigger: 'anyTrainer',
  startsOnVisit: 2,
  durationMinutes: 10,
  standardPercent: 10,
  vipPercent: 10,
  newBuyersOnly: false,
  trainerIds: ['t1'],
};

describe('discount services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should put the trigger and the coaches when the coach timer is saved', async () => {
    const done = TestBed.inject(TrainerDiscountsService).changeTimer(timerDraft);

    const request = http.expectOne('/api/admin/trainer-timer');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(
      expect.objectContaining({ trigger: 2, trainerIds: ['t1'] }),
    );
    request.flush({ isSuccess: true });
    await done;
  });

  it('should delete the campaign by its id when a coach campaign is removed', async () => {
    const done = TestBed.inject(TrainerDiscountsService).removeCampaign('a/b');

    const request = http.expectOne('/api/admin/trainer-campaigns/a%2Fb');
    expect(request.request.method).toBe('DELETE');
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put no coach fields when the tariff timer is saved', async () => {
    const done = TestBed.inject(TariffDiscountsService).changeTimer(timerDraft);

    const request = http.expectOne('/api/admin/tariff-timer');
    expect(request.request.body).not.toHaveProperty('trigger');
    expect(request.request.body).not.toHaveProperty('trainerIds');
    request.flush({ isSuccess: true });
    await done;
  });

  it('should list no coaches without a request when the tariff page asks for them', async () => {
    expect(await TestBed.inject(TariffDiscountsService).listTrainers()).toEqual([]);
  });

  it('should read the tariff campaigns when the list is loaded', async () => {
    const done = TestBed.inject(TariffDiscountsService).listCampaigns();

    http.expectOne('/api/admin/tariff-campaigns').flush({ isSuccess: true, data: [] });

    expect(await done).toEqual([]);
  });
});
