import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_ORIGIN } from '@landing/core/config/api-origin';
import { PublicTrainersService } from './public-trainers.service';

const API = 'https://api.example.test';

describe('PublicTrainersService', () => {
  let http: HttpTestingController;
  let service: PublicTrainersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_ORIGIN, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PublicTrainersService);
  });

  it('should return the mapped trainer when the backend finds the slug', async () => {
    const result = firstValueFrom(service.findBySlug('aziz-karimov'));

    http.expectOne(`${API}/public/trainers/aziz-karimov`).flush({
      data: {
        id: 'trainer-1',
        slug: 'aziz-karimov',
        displayName: 'Aziz Karimov',
        bio: null,
        photoFileId: null,
        monthlyPrice: 299000,
        averageRating: null,
        reviewCount: 0,
        workoutPrograms: [],
        mealPrograms: [],
        previewVideos: [],
      },
    });

    expect((await result)?.displayName).toBe('Aziz Karimov');
  });

  it('should return null when the backend answers not found', async () => {
    const result = firstValueFrom(service.findBySlug('yoq'));

    http
      .expectOne(`${API}/public/trainers/yoq`)
      .flush({ isSuccess: false }, { status: 404, statusText: 'Not Found' });

    expect(await result).toBeNull();
  });

  it('should fail when the backend is unavailable', async () => {
    const result = firstValueFrom(service.findBySlug('aziz-karimov'));

    http
      .expectOne(`${API}/public/trainers/aziz-karimov`)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });

    await expect(result).rejects.toMatchObject({ status: 503 });
  });

  it('should escape the slug when it holds url characters', () => {
    service.findBySlug('a/b').subscribe();

    expect(http.expectOne(`${API}/public/trainers/a%2Fb`).request.method).toBe('GET');
  });
});
