import { Component, computed, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { TranslationKey } from '@core/i18n/dictionary';
import { formatCount, formatDecimal } from '../../models/analytics-format';
import { mealTypeLabel, sourceLabel } from '../../models/analytics-labels';
import { FoodSummary, WorkoutSummary } from '../../models/engagement';
import { Usage, toUsageRows } from '../../models/usage';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';
import { UsageList } from '../usage-list/usage-list';

interface Fact {
  readonly label: TranslationKey;
  readonly value: string;
}

@Component({
  selector: 'app-activity-panels',
  imports: [DashboardPanel, TranslatePipe, UsageList],
  templateUrl: './activity-panels.html',
})
export class ActivityPanels {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly workouts = input<WorkoutSummary | null>(null);
  readonly foods = input<FoodSummary | null>(null);

  protected readonly workoutFacts = computed<readonly Fact[]>(() => {
    const workouts = this.workouts();
    if (workouts === null) {
      return [];
    }
    const locale = this.localeStore.locale();
    return [
      { label: 'dashboard.workouts.finished', value: formatCount(workouts.finished, locale) },
      {
        label: 'dashboard.workouts.averageMinutes',
        value: this.translator.translate('dashboard.workouts.minutes', {
          value: formatDecimal(workouts.averageMinutes, locale),
        }),
      },
      {
        label: 'dashboard.workouts.averageSets',
        value: formatDecimal(workouts.averageSets, locale),
      },
      { label: 'dashboard.workouts.records', value: formatCount(workouts.personalRecords, locale) },
    ];
  });
  protected readonly workoutSources = computed(() =>
    this.rows(this.workouts()?.bySource ?? [], sourceLabel),
  );
  protected readonly foodLogged = computed(() =>
    formatCount(this.foods()?.logged ?? 0, this.localeStore.locale()),
  );
  protected readonly foodSources = computed(() =>
    this.rows(this.foods()?.bySource ?? [], sourceLabel),
  );
  protected readonly foodMeals = computed(() =>
    this.rows(this.foods()?.byMealType ?? [], mealTypeLabel),
  );

  private rows(usages: readonly Usage[], keyOf: (value: string) => TranslationKey | null) {
    return toUsageRows(usages, {
      label: (usage) => {
        const key = keyOf(usage.label);
        return key === null ? usage.label : this.translator.translate(key);
      },
      value: (usage) => formatCount(usage.value, this.localeStore.locale()),
    });
  }
}
