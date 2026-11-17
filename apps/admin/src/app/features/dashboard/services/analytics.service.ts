import { Injectable, inject } from '@angular/core';
import { AnalyticsApp } from '../models/analytics-app';
import { DateSpan } from '../models/analytics-period';
import { Audience } from '../models/audience';
import { Engagement } from '../models/engagement';
import { Reach } from '../models/reach';
import { Realtime } from '../models/realtime';
import { Cohort } from '../models/retention';
import { audienceRequests, toAudience } from './audience.mapper';
import { engagementRequests, toEngagement } from './engagement.mapper';
import { Ga4ClientService } from './ga4-client.service';
import { Ga4BatchResponse, Ga4Report, Ga4ReportRequest } from './ga4.dto';
import { reachRequests, toReach } from './reach.mapper';
import { realtimeMinutesRequest, realtimePlatformsRequest, toRealtime } from './realtime.mapper';
import { retentionRequest, toCohorts } from './retention.mapper';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly ga4 = inject(Ga4ClientService);

  async audience(app: AnalyticsApp, span: DateSpan): Promise<Audience> {
    return toAudience(await this.batch(audienceRequests(app, span)), span);
  }

  async reach(app: AnalyticsApp, span: DateSpan): Promise<Reach> {
    return toReach(await this.batch(reachRequests(app, span)));
  }

  async engagement(app: AnalyticsApp, span: DateSpan): Promise<Engagement> {
    return toEngagement(await this.batch(engagementRequests(app, span)));
  }

  async retention(app: AnalyticsApp, weeks: readonly DateSpan[]): Promise<readonly Cohort[]> {
    const report = await this.ga4.post<Ga4Report>('runReport', retentionRequest(app, weeks));
    return toCohorts(report, weeks);
  }

  async realtime(app: AnalyticsApp): Promise<Realtime> {
    const [platforms, minutes] = await Promise.all([
      this.ga4.post<Ga4Report>('runRealtimeReport', realtimePlatformsRequest(app)),
      this.ga4.post<Ga4Report>('runRealtimeReport', realtimeMinutesRequest(app)),
    ]);
    return toRealtime(platforms, minutes);
  }

  private async batch(requests: readonly Ga4ReportRequest[]): Promise<readonly Ga4Report[]> {
    const response = await this.ga4.post<Ga4BatchResponse>('batchRunReports', { requests });
    return response.reports ?? [];
  }
}
