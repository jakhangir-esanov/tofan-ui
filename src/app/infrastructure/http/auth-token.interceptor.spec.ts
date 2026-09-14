import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RefreshSessionUseCase } from '@application/auth/refresh-session.use-case';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { provideApiConfiguration } from '@infrastructure/api/generated/api-configuration';
import { firstValueFrom } from 'rxjs';
import { ANONYMOUS_REQUEST } from './auth-context';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  const user = new UserProfile('1', 'admin', 'Admin', ['admin']);
  const future = new Date(Date.now() + 60_000);
  const past = new Date(Date.now() - 60_000);

  const live = new AuthSession(user, 'live', future, 'refresh', null);
  const expired = new AuthSession(user, 'expired', past, 'refresh', null);
  const renewed = new AuthSession(user, 'renewed', future, 'refresh-2', null);

  let stored: AuthSession | null;
  let refresh: ReturnType<typeof vi.fn>;
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    stored = live;
    refresh = vi.fn(async () => {
      stored = renewed;
      return renewed;
    });

    TestBed.configureTestingModule({
      providers: [
        provideApiConfiguration('/api'),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: SessionRepository,
          useValue: { get: () => stored, save: vi.fn(), clear: vi.fn() },
        },
        { provide: RefreshSessionUseCase, useValue: { execute: refresh } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('attaches the stored token to API requests only', () => {
    void firstValueFrom(http.get('/api/exercises'));
    void firstValueFrom(http.get('https://cdn.example.com/video.mp4'));

    expect(backend.expectOne('/api/exercises').request.headers.get('Authorization')).toBe(
      'Bearer live',
    );
    expect(
      backend.expectOne('https://cdn.example.com/video.mp4').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('sends anonymous requests without a token', () => {
    const context = new HttpContext().set(ANONYMOUS_REQUEST, true);
    void firstValueFrom(http.post('/api/auth/login', {}, { context }));

    expect(backend.expectOne('/api/auth/login').request.headers.has('Authorization')).toBe(false);
  });

  it('refreshes an expired token before sending', async () => {
    stored = expired;
    const response = firstValueFrom(http.get('/api/exercises'));
    await Promise.resolve();

    const request = backend.expectOne('/api/exercises');
    expect(request.request.headers.get('Authorization')).toBe('Bearer renewed');
    request.flush({ ok: true });

    await expect(response).resolves.toEqual({ ok: true });
  });

  it('refreshes once and retries after a 401', async () => {
    const response = firstValueFrom(http.get('/api/exercises'));

    backend.expectOne('/api/exercises').flush(null, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();

    const retry = backend.expectOne('/api/exercises');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer renewed');
    retry.flush({ ok: true });

    await expect(response).resolves.toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('passes the 401 on when the session cannot be renewed', async () => {
    refresh.mockResolvedValue(null);
    const response = firstValueFrom(http.get('/api/exercises'));

    backend.expectOne('/api/exercises').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(response).rejects.toMatchObject({ status: 401 });
  });
});
