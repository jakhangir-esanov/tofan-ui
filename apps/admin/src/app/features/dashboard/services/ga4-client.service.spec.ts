import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@core/http/api-client';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Ga4ClientService } from './ga4-client.service';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REPORT_URL = 'https://analyticsdata.googleapis.com/v1beta/properties/553445328:runReport';

async function generatePem(): Promise<string> {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ['sign', 'verify'],
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  return `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...pkcs8))}\n-----END PRIVATE KEY-----`;
}

async function flushPromises(): Promise<void> {
  for (let round = 0; round < 20; round++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe('Ga4ClientService', () => {
  let apiClient: Pick<ApiClient, 'get'>;
  let http: HttpTestingController;
  let client: Ga4ClientService;

  beforeEach(async () => {
    apiClient = {
      get: vi.fn().mockResolvedValue({
        clientEmail: 'reader@tofan.iam.gserviceaccount.com',
        privateKey: await generatePem(),
        propertyId: '553445328',
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiClient, useValue: apiClient },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(Ga4ClientService);
  });

  async function answerToken(value: string): Promise<void> {
    await flushPromises();
    const request = http.expectOne(TOKEN_URL);
    expect(request.request.body).toContain(
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer',
    );
    request.flush({ access_token: value, expires_in: 3600 });
  }

  it('should send the report with a Google token and reuse the token next time', async () => {
    const first = client.post('runReport', { metrics: [] });
    await answerToken('token-1');
    await flushPromises();
    const report = http.expectOne(REPORT_URL);
    expect(report.request.headers.get('authorization')).toBe('Bearer token-1');
    report.flush({ rows: [] });
    await expect(first).resolves.toEqual({ rows: [] });

    const second = client.post('runReport', { metrics: [] });
    await flushPromises();
    http.expectNone(TOKEN_URL);
    http.expectOne(REPORT_URL).flush({ rows: [] });
    await second;

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith('/admin/analytics/ga4-credentials');
  });

  it('should get a new token and retry once when Google rejects the token', async () => {
    const result = client.post('runReport', {});
    await answerToken('old');
    await flushPromises();
    http.expectOne(REPORT_URL).flush({}, { status: 401, statusText: 'Unauthorized' });
    await answerToken('new');
    await flushPromises();
    const retry = http.expectOne(REPORT_URL);
    expect(retry.request.headers.get('authorization')).toBe('Bearer new');
    retry.flush({ rows: [] });

    await expect(result).resolves.toEqual({ rows: [] });
  });

  it('should turn a Google failure into an unavailable error with the analytics code', async () => {
    const result = client.post('runReport', {});
    await answerToken('token');
    await flushPromises();
    http.expectOne(REPORT_URL).flush({}, { status: 429, statusText: 'Too Many Requests' });

    await expect(result).rejects.toBeInstanceOf(ServiceUnavailableError);
    await expect(result).rejects.toMatchObject({ code: 'Analytics.Unavailable' });
  });

  it('should ask for the credentials again after the backend failed to give them', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ServiceUnavailableError());

    await expect(client.post('runReport', {})).rejects.toBeInstanceOf(ServiceUnavailableError);
    void client.post('runReport', {});
    await flushPromises();

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('should ask Google for one token when several reports start together', async () => {
    const first = client.post('runReport', {});
    const second = client.post('runReport', {});
    await answerToken('shared');
    await flushPromises();
    const reports = http.match(REPORT_URL);
    expect(reports).toHaveLength(2);
    reports.forEach((report) => report.flush({ rows: [] }));

    await Promise.all([first, second]);
    http.expectNone(TOKEN_URL);
  });
});
