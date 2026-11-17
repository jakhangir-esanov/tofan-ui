import { Component, computed, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { formatCount, formatNumericDate, formatPercent } from '../../models/analytics-format';
import { Cohort, retentionRate } from '../../models/retention';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';

interface RetentionCell {
  readonly week: number;
  readonly text: string;
  readonly strength: number;
  readonly contrast: boolean;
}

interface RetentionLine {
  readonly key: string;
  readonly week: string;
  readonly users: string;
  readonly cells: readonly RetentionCell[];
}

const STRONGEST = 1;
const CONTRAST_FROM = 0.5;

@Component({
  selector: 'app-retention-table',
  imports: [DashboardPanel, TranslatePipe],
  templateUrl: './retention-table.html',
})
export class RetentionTable {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly cohorts = input.required<readonly Cohort[]>();

  protected readonly weekHeaders = computed(() =>
    Array.from({ length: this.cohorts().length }, (_, week) =>
      this.translator.translate('dashboard.retention.week', { n: week }),
    ),
  );
  protected readonly lines = computed<readonly RetentionLine[]>(() => {
    const locale = this.localeStore.locale();
    return this.cohorts().map((cohort) => ({
      key: cohort.weekStart.toISOString(),
      week: formatNumericDate(cohort.weekStart, locale),
      users: formatCount(cohort.users, locale),
      cells: cohort.retained.map((_, week) => {
        const rate = retentionRate(cohort, week) ?? 0;
        const strength = Math.min(rate, STRONGEST);
        const text = formatPercent(rate, locale);
        return { week, text, strength, contrast: strength > CONTRAST_FROM };
      }),
    }));
  });
}
