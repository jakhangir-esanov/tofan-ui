import { Component, computed, inject, input } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { formatCount } from '../../models/analytics-format';
import { KEY_EVENT_LABELS } from '../../models/analytics-labels';
import { EventUsage, KEY_EVENTS, keyEventCount } from '../../models/engagement';
import { KpiCard } from '../kpi-card/kpi-card';

@Component({
  selector: 'app-key-events',
  imports: [KpiCard, TranslatePipe],
  template: `
    @if (cards().length > 0) {
      <section class="flex flex-col gap-3">
        <h2 class="m-0 text-base font-semibold">{{ 'dashboard.engagement.keyEvents' | t }}</h2>
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          @for (card of cards(); track card.name) {
            <app-kpi-card [label]="card.label" [value]="card.value" />
          }
        </div>
      </section>
    }
  `,
})
export class KeyEvents {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly events = input.required<readonly EventUsage[]>();

  protected readonly cards = computed(() =>
    KEY_EVENTS.map((name) => ({ name, total: keyEventCount(this.events(), name) }))
      .filter((event) => event.total > 0)
      .map((event) => ({
        name: event.name,
        label: this.translator.translate(KEY_EVENT_LABELS[event.name]),
        value: formatCount(event.total, this.localeStore.locale()),
      })),
  );
}
