import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@core/http/api-client';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { Ga4ClientService, Ga4Method } from './ga4-client.service';

describe('Ga4ClientService', () => {
  let post: ReturnType<typeof vi.fn>;
  let client: Ga4ClientService;

  beforeEach(() => {
    post = vi.fn().mockResolvedValue({ rowCount: 1 });
    TestBed.configureTestingModule({
      providers: [{ provide: ApiClient, useValue: { post } }],
    });
    client = TestBed.inject(Ga4ClientService);
  });

  it.each<[Ga4Method, string]>([
    ['runReport', '/admin/analytics/reports/RunReport'],
    ['batchRunReports', '/admin/analytics/reports/BatchRunReports'],
    ['runRealtimeReport', '/admin/analytics/reports/RunRealtimeReport'],
  ])('should post the report to the backend when the method is %s', async (method, path) => {
    const body = { dimensions: [{ name: 'date' }] };

    const report = await client.post<{ rowCount: number }>(method, body);

    expect(post).toHaveBeenCalledWith(path, body);
    expect(report).toEqual({ rowCount: 1 });
  });

  it('should pass the backend error on when the report fails', async () => {
    const failure = new BusinessRuleError(
      'Analytics is not configured.',
      'Analytics.NotConfigured',
    );
    post.mockRejectedValue(failure);

    await expect(client.post('runReport', {})).rejects.toBe(failure);
  });
});
