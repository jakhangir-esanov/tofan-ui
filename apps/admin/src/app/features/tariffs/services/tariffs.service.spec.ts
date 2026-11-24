import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/http/api-base-url';
import { TariffDraft } from '../models/tariff-draft';
import { TariffsService } from './tariffs.service';

const flushTariff = {
  id: 'x',
  monthlyPrice: 0,
  totalPrice: 0,
  foodScanLimit: null,
  workoutVideoLimit: null,
  dietMealTypes: null,
  workoutChangeMonths: null,
  dietChangeDays: null,
  hasAiTrainerChat: false,
  benefits: [],
};

describe('TariffsService', () => {
  let service: TariffsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(TariffsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list the tariffs in the order Free, Standard, VIP when the backend answers', async () => {
    const done = service.list();

    const request = http.expectOne('/api/tariffs');
    expect(request.request.method).toBe('GET');
    request.flush({
      isSuccess: true,
      data: [
        { ...flushTariff, id: 'v', type: 3 },
        { ...flushTariff, id: 'f', type: 1 },
        { ...flushTariff, id: 's', type: 2 },
      ],
    });

    expect((await done).map((tariff) => tariff.id)).toEqual(['f', 's', 'v']);
  });

  it('should put all seven fields with null limits when every limit is switched off', async () => {
    const draft: TariffDraft = {
      monthlyPrice: 49000,
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
      hasAiTrainerChat: false,
    };

    const done = service.change('standard', draft);

    const request = http.expectOne('/api/admin/tariffs/2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      monthlyPrice: 49000,
      foodScanLimit: null,
      workoutVideoLimit: null,
      dietMealTypes: null,
      workoutChangeMonths: null,
      dietChangeDays: null,
      hasAiTrainerChat: false,
    });
    expect(Object.keys(request.request.body as object)).toHaveLength(7);
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put the tariff type as an integer and the meal types as integers when changing a tariff', async () => {
    const draft: TariffDraft = {
      monthlyPrice: 99000,
      foodScanLimit: 0,
      workoutVideoLimit: 10,
      dietMealTypes: ['breakfast', 'postWorkout'],
      workoutChangeMonths: 1,
      dietChangeDays: 1,
      hasAiTrainerChat: true,
    };

    const done = service.change('vip', draft);

    const request = http.expectOne('/api/admin/tariffs/3');
    expect(request.request.body).toEqual({
      monthlyPrice: 99000,
      foodScanLimit: 0,
      workoutVideoLimit: 10,
      dietMealTypes: [1, 6],
      workoutChangeMonths: 1,
      dietChangeDays: 1,
      hasAiTrainerChat: true,
    });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put the whole ordered list under the tariff type number when the benefits are saved', async () => {
    const done = service.changeBenefits('vip', [
      { en: 'Second', ru: 'Второй', uz: 'Ikkinchi' },
      { en: 'First', ru: 'Первый', uz: 'Birinchi' },
    ]);

    const request = http.expectOne('/api/admin/tariffs/3/benefits');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      benefits: [
        { name: 'Second', nameRu: 'Второй', nameUz: 'Ikkinchi' },
        { name: 'First', nameRu: 'Первый', nameUz: 'Birinchi' },
      ],
    });
    request.flush({ isSuccess: true });
    await done;
  });

  it('should put an empty list under the Free tariff number when every benefit was removed', async () => {
    const done = service.changeBenefits('free', []);

    const request = http.expectOne('/api/admin/tariffs/1/benefits');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ benefits: [] });
    request.flush({ isSuccess: true });
    await done;
  });
});
