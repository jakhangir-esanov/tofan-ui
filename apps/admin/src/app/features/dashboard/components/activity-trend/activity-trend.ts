import { Component, computed, inject, input, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Chart } from '@shared/components/chart/chart';
import { ChartSeries } from '@shared/components/chart/chart-config';
import { formatCount, formatLongDay, formatShortDay } from '../../models/analytics-format';
import { AudienceDay } from '../../models/audience';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';

interface TrendRow {
  readonly key: string;
  readonly date: string;
  readonly activeUsers: string;
  readonly newUsers: string;
}

@Component({
  selector: 'app-activity-trend',
  imports: [Button, Chart, DashboardPanel, TranslatePipe],
  templateUrl: './activity-trend.html',
})
export class ActivityTrend {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly days = input.required<readonly AudienceDay[]>();

  protected readonly asTable = signal(false);
  protected readonly heading = computed(() => this.translator.translate('dashboard.trend.title'));
  protected readonly labels = computed(() =>
    this.days().map((day) => formatShortDay(day.date, this.localeStore.locale())),
  );
  protected readonly titles = computed(() =>
    this.days().map((day) => formatLongDay(day.date, this.localeStore.locale())),
  );
  protected readonly series = computed<readonly ChartSeries[]>(() => [
    {
      label: this.translator.translate('dashboard.trend.activeUsers'),
      values: this.days().map((day) => day.activeUsers),
    },
    {
      label: this.translator.translate('dashboard.trend.newUsers'),
      values: this.days().map((day) => day.newUsers),
    },
  ]);
  protected readonly rows = computed<readonly TrendRow[]>(() => {
    const locale = this.localeStore.locale();
    return [...this.days()].reverse().map((day) => ({
      key: day.date.toISOString(),
      date: formatLongDay(day.date, locale),
      activeUsers: formatCount(day.activeUsers, locale),
      newUsers: formatCount(day.newUsers, locale),
    }));
  });
}
