import { Component, computed, inject, input } from '@angular/core';
import { AppLocale } from '@core/i18n/locale';
import { LocaleStore } from '@core/i18n/locale.store';
import { Translator } from '@core/i18n/translator';
import {
  formatChange,
  formatCount,
  formatDecimal,
  formatPercent,
  toMinutesAndSeconds,
} from '../../models/analytics-format';
import { Audience, AudienceTotals } from '../../models/audience';
import { isComparable, relativeChange } from '../../models/usage';
import { ChangeTone, KpiCard } from '../kpi-card/kpi-card';

interface Kpi {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly change?: string;
  readonly tone: ChangeTone;
  readonly hint?: string;
}

type ComparedKey = 'activeUsers' | 'newUsers' | 'sessions' | 'engagementRate' | 'engagementTime';

interface ComparedKpi {
  readonly key: ComparedKey;
  readonly read: (totals: AudienceTotals) => number;
  readonly format: (totals: AudienceTotals, locale: AppLocale, translator: Translator) => string;
  readonly hint?: (totals: AudienceTotals, locale: AppLocale, translator: Translator) => string;
}

const COMPARED_KPIS: readonly ComparedKpi[] = [
  {
    key: 'activeUsers',
    read: (totals) => totals.activeUsers,
    format: (totals, locale) => formatCount(totals.activeUsers, locale),
  },
  {
    key: 'newUsers',
    read: (totals) => totals.newUsers,
    format: (totals, locale) => formatCount(totals.newUsers, locale),
  },
  {
    key: 'sessions',
    read: (totals) => totals.sessions,
    format: (totals, locale) => formatCount(totals.sessions, locale),
    hint: (totals, locale, translator) =>
      translator.translate('dashboard.kpi.sessionsPerUser', {
        value: formatDecimal(totals.sessionsPerUser, locale),
      }),
  },
  {
    key: 'engagementRate',
    read: (totals) => totals.engagementRate,
    format: (totals, locale) => formatPercent(totals.engagementRate, locale),
    hint: (_, __, translator) => translator.translate('dashboard.kpi.engagedHint'),
  },
  {
    key: 'engagementTime',
    read: (totals) => totals.engagementSecondsPerUser,
    format: (totals, _, translator) =>
      translator.translate('dashboard.kpi.minutes', {
        ...toMinutesAndSeconds(totals.engagementSecondsPerUser),
      }),
    hint: (_, __, translator) => translator.translate('dashboard.kpi.timeHint'),
  },
];

@Component({
  selector: 'app-audience-summary',
  imports: [KpiCard],
  template: `
    <div class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
      @for (kpi of kpis(); track kpi.key) {
        <app-kpi-card
          [label]="kpi.label"
          [value]="kpi.value"
          [change]="kpi.change"
          [tone]="kpi.tone"
          [hint]="kpi.hint"
        />
      }
    </div>
  `,
})
export class AudienceSummary {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly audience = input.required<Audience>();

  protected readonly kpis = computed<readonly Kpi[]>(() => [
    ...COMPARED_KPIS.map((kpi) => this.compared(kpi)),
    this.stickiness(),
  ]);

  private compared(kpi: ComparedKpi): Kpi {
    const { current, previous } = this.audience();
    const locale = this.localeStore.locale();
    return {
      key: kpi.key,
      label: this.translator.translate(`dashboard.kpi.${kpi.key}`),
      value: kpi.format(current, locale, this.translator),
      ...this.changeOf(kpi, current, previous, locale),
      ...(kpi.hint === undefined ? {} : { hint: kpi.hint(current, locale, this.translator) }),
    };
  }

  private changeOf(
    kpi: ComparedKpi,
    current: AudienceTotals,
    previous: AudienceTotals,
    locale: AppLocale,
  ): Pick<Kpi, 'change' | 'tone'> {
    const change = relativeChange(kpi.read(current), kpi.read(previous));
    if (change === null) {
      return { tone: 'flat', change: this.translator.translate('dashboard.kpi.noComparison') };
    }
    if (!isComparable(previous.activeUsers)) {
      const value = kpi.format(previous, locale, this.translator);
      return {
        tone: 'flat',
        change: this.translator.translate('dashboard.kpi.previous', { value }),
      };
    }
    const value = formatChange(change, locale);
    return {
      tone: toneOf(change),
      change: this.translator.translate('dashboard.kpi.change', { value }),
    };
  }

  private stickiness(): Kpi {
    const { stickiness } = this.audience();
    const locale = this.localeStore.locale();
    return {
      key: 'stickiness',
      label: this.translator.translate('dashboard.kpi.stickiness'),
      value: formatPercent(stickiness.dauPerMau, locale),
      tone: 'flat',
      hint: this.translator.translate('dashboard.kpi.stickinessHint', {
        daily: formatCount(stickiness.daily, locale),
        weekly: formatCount(stickiness.weekly, locale),
        monthly: formatCount(stickiness.monthly, locale),
      }),
    };
  }
}

function toneOf(change: number): ChangeTone {
  if (change > 0) {
    return 'up';
  }
  return change < 0 ? 'down' : 'flat';
}
