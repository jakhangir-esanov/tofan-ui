import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';

export type Ga4Method = 'runReport' | 'batchRunReports' | 'runRealtimeReport';

const REPORTS = '/admin/analytics/reports';

const REPORT_KIND: Readonly<Record<Ga4Method, string>> = {
  runReport: 'RunReport',
  batchRunReports: 'BatchRunReports',
  runRealtimeReport: 'RunRealtimeReport',
};

@Injectable({ providedIn: 'root' })
export class Ga4ClientService {
  private readonly apiClient = inject(ApiClient);

  post<TResponse>(method: Ga4Method, body: unknown): Promise<TResponse> {
    return this.apiClient.post<TResponse>(`${REPORTS}/${REPORT_KIND[method]}`, body);
  }
}
