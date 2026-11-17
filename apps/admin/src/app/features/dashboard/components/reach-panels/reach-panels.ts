import { Component, computed, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { countryName, formatCount, formatPercent } from '../../models/analytics-format';
import { Reach } from '../../models/reach';
import { Usage, shareOf, toUsageRows } from '../../models/usage';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';
import { UsageList } from '../usage-list/usage-list';

@Component({
  selector: 'app-reach-panels',
  imports: [DashboardPanel, TranslatePipe, UsageList],
  templateUrl: './reach-panels.html',
})
export class ReachPanels {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly reach = input.required<Reach>();

  protected readonly platformRows = computed(() => {
    const platforms = this.reach().platforms;
    return toUsageRows(platforms, {
      label: (platform) => platform.label,
      value: (platform) => this.users(platform),
      caption: (platform) =>
        formatPercent(shareOf(platform.value, platforms), this.localeStore.locale()),
    });
  });
  protected readonly versionRows = computed(() =>
    toUsageRows(this.reach().versions, {
      label: (version) => version.label,
      value: (version) => this.users(version),
      caption: (version) =>
        version.crashFreeRate === null
          ? ''
          : this.translator.translate('dashboard.reach.crashFree', {
              value: formatPercent(version.crashFreeRate, this.localeStore.locale()),
            }),
    }),
  );
  protected readonly systemRows = computed(() => this.plainRows(this.reach().operatingSystems));
  protected readonly deviceRows = computed(() => this.plainRows(this.reach().devices));
  protected readonly countryRows = computed(() =>
    toUsageRows(this.reach().countries, {
      label: (country) => countryName(country.code, country.label, this.localeStore.locale()),
      value: (country) => this.users(country),
    }),
  );

  private plainRows(usages: readonly Usage[]) {
    return toUsageRows(usages, {
      label: (usage) => usage.label,
      value: (usage) => this.users(usage),
    });
  }

  private users(usage: Usage): string {
    return formatCount(usage.value, this.localeStore.locale());
  }
}
