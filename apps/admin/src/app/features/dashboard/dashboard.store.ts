import { Injectable, computed, inject, signal } from '@angular/core';
import { AnalyticsApp, DEFAULT_ANALYTICS_APP } from './models/analytics-app';
import {
  AnalyticsPeriod,
  DEFAULT_ANALYTICS_PERIOD,
  DateSpan,
  periodSpan,
  previousSpan,
} from './models/analytics-period';
import { Audience } from './models/audience';
import { Engagement } from './models/engagement';
import { Reach } from './models/reach';
import { Realtime } from './models/realtime';
import { Cohort, RETENTION_WEEKS, cohortWeeks } from './models/retention';
import { AnalyticsService } from './services/analytics.service';

@Injectable()
export class DashboardStore {
  private readonly analytics = inject(AnalyticsService);
  private loadRound = 0;

  readonly app = signal<AnalyticsApp>(DEFAULT_ANALYTICS_APP);
  readonly period = signal<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD);
  readonly audience = signal<Audience | null>(null);
  readonly reach = signal<Reach | null>(null);
  readonly engagement = signal<Engagement | null>(null);
  readonly cohorts = signal<readonly Cohort[] | null>(null);
  readonly realtime = signal<Realtime | null>(null);
  readonly realtimeAt = signal<Date | null>(null);
  readonly span = signal<DateSpan | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);

  readonly previousSpan = computed(() => {
    const span = this.span();
    return span === null ? null : previousSpan(span);
  });

  readonly empty = computed(
    () => !this.loading() && !this.failed() && this.audience()?.current.activeUsers === 0,
  );

  async load(now: Date = new Date()): Promise<void> {
    const round = ++this.loadRound;
    const app = this.app();
    const span = periodSpan(this.period(), now);
    this.span.set(span);
    this.loading.set(true);
    this.failed.set(false);
    const realtime = this.loadRealtime(round, app).catch(hideRealtimeUntilNextRefresh);
    const results = await Promise.allSettled([
      this.keep(round, this.audience, this.analytics.audience(app, span)),
      this.keep(round, this.reach, this.analytics.reach(app, span)),
      this.keep(round, this.engagement, this.analytics.engagement(app, span)),
      this.keep(
        round,
        this.cohorts,
        this.analytics.retention(app, cohortWeeks(now, RETENTION_WEEKS)),
      ),
    ]);
    await realtime;
    if (round === this.loadRound) {
      this.failed.set(results.some((result) => result.status === 'rejected'));
      this.loading.set(false);
    }
  }

  async refreshRealtime(): Promise<void> {
    await this.loadRealtime(this.loadRound, this.app()).catch(hideRealtimeUntilNextRefresh);
  }

  async selectApp(app: AnalyticsApp): Promise<void> {
    this.app.set(app);
    this.clear();
    await this.load();
  }

  async selectPeriod(period: AnalyticsPeriod): Promise<void> {
    this.period.set(period);
    await this.load();
  }

  private async loadRealtime(round: number, app: AnalyticsApp): Promise<void> {
    await this.keep(round, this.realtime, this.analytics.realtime(app));
    if (round === this.loadRound) {
      this.realtimeAt.set(new Date());
    }
  }

  private clear(): void {
    this.audience.set(null);
    this.reach.set(null);
    this.engagement.set(null);
    this.cohorts.set(null);
    this.realtime.set(null);
    this.realtimeAt.set(null);
  }

  private async keep<T>(
    round: number,
    target: { set: (value: T | null) => void },
    request: Promise<T>,
  ): Promise<void> {
    try {
      const value = await request;
      if (round === this.loadRound) {
        target.set(value);
      }
    } catch (error) {
      if (round === this.loadRound) {
        target.set(null);
      }
      throw error;
    }
  }
}

function hideRealtimeUntilNextRefresh(): void {
  return;
}
