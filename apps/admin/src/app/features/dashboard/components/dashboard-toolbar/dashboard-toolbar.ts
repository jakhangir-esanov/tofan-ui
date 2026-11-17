import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { toSelectOptions } from '@shared/models/select-option';
import { ANALYTICS_APPS, AnalyticsApp } from '../../models/analytics-app';
import { ANALYTICS_APP_LABELS, ANALYTICS_PERIOD_LABELS } from '../../models/analytics-labels';
import { ANALYTICS_PERIODS, AnalyticsPeriod } from '../../models/analytics-period';

@Component({
  selector: 'app-dashboard-toolbar',
  imports: [FormsModule, SelectButton, TranslatePipe],
  templateUrl: './dashboard-toolbar.html',
})
export class DashboardToolbar {
  private readonly translator = inject(Translator);

  readonly app = input.required<AnalyticsApp>();
  readonly period = input.required<AnalyticsPeriod>();

  readonly appChange = output<AnalyticsApp>();
  readonly periodChange = output<AnalyticsPeriod>();

  protected readonly appOptions = computed(() =>
    this.translator.options(toSelectOptions(ANALYTICS_APPS, ANALYTICS_APP_LABELS)),
  );
  protected readonly periodOptions = computed(() =>
    this.translator.options(
      ANALYTICS_PERIODS.map((value) => ({ value, label: ANALYTICS_PERIOD_LABELS[value] })),
    ),
  );
}
