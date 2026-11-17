import { Component, computed, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { Translator } from '@core/i18n/translator';
import { Chart } from '@shared/components/chart/chart';
import { ChartSeries } from '@shared/components/chart/chart-config';
import { formatClock, formatCount } from '../../models/analytics-format';
import { Realtime } from '../../models/realtime';
import { toUsageRows } from '../../models/usage';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';
import { UsageList } from '../usage-list/usage-list';

const MINUTES_CHART_HEIGHT = '6rem';

@Component({
  selector: 'app-realtime-panel',
  imports: [Chart, DashboardPanel, UsageList],
  template: `
    <app-dashboard-panel [heading]="heading()" [hint]="hint()">
      <div class="flex items-center gap-3">
        <span class="relative flex size-3">
          <span
            class="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-60"
          ></span>
          <span class="bg-primary relative inline-flex size-3 rounded-full"></span>
        </span>
        <strong class="text-4xl font-semibold">{{ total() }}</strong>
      </div>
      @if (updated(); as text) {
        <span class="text-muted-color -mt-2 text-xs">{{ text }}</span>
      }
      @if (realtime().activeUsers > 0) {
        <app-chart
          kind="bar"
          [labels]="minuteLabels()"
          [series]="minuteSeries()"
          [height]="chartHeight"
          [compact]="true"
          [ariaLabel]="minutesCaption()"
        />
        <span class="text-muted-color text-xs">{{ minutesCaption() }}</span>
        <app-usage-list [rows]="platformRows()" />
      }
    </app-dashboard-panel>
  `,
})
export class RealtimePanel {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly realtime = input.required<Realtime>();
  readonly updatedAt = input<Date | null>(null);

  protected readonly chartHeight = MINUTES_CHART_HEIGHT;
  protected readonly heading = computed(() =>
    this.translator.translate('dashboard.realtime.title'),
  );
  protected readonly hint = computed(() => this.translator.translate('dashboard.realtime.hint'));
  protected readonly updated = computed(() => {
    const updatedAt = this.updatedAt();
    if (updatedAt === null) {
      return null;
    }
    const time = formatClock(updatedAt, this.localeStore.locale());
    return this.translator.translate('dashboard.realtime.updated', { time });
  });
  protected readonly minutesCaption = computed(() =>
    this.translator.translate('dashboard.realtime.perMinute'),
  );
  protected readonly total = computed(() =>
    formatCount(this.realtime().activeUsers, this.localeStore.locale()),
  );
  protected readonly minuteLabels = computed(() =>
    this.oldestFirst().map((_, index, all) => `-${all.length - 1 - index}`),
  );
  protected readonly minuteSeries = computed<readonly ChartSeries[]>(() => [
    { label: this.translator.translate('dashboard.realtime.users'), values: this.oldestFirst() },
  ]);
  protected readonly platformRows = computed(() =>
    toUsageRows(this.realtime().platforms, {
      label: (usage) => usage.label,
      value: (usage) => formatCount(usage.value, this.localeStore.locale()),
    }),
  );

  private oldestFirst(): readonly number[] {
    return [...this.realtime().perMinute].reverse();
  }
}
