import { Component, computed, inject, input, signal } from '@angular/core';
import { LocaleStore } from '@core/i18n/locale.store';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { formatCount } from '../../models/analytics-format';
import { eventLabel } from '../../models/analytics-labels';
import { Engagement, EventUsage } from '../../models/engagement';
import { toUsageRows } from '../../models/usage';
import { DashboardPanel } from '../dashboard-panel/dashboard-panel';
import { UsageList } from '../usage-list/usage-list';

const SHORT_EVENT_LIST = 10;

@Component({
  selector: 'app-engagement-panels',
  imports: [Button, DashboardPanel, TranslatePipe, UsageList],
  templateUrl: './engagement-panels.html',
})
export class EngagementPanels {
  private readonly translator = inject(Translator);
  private readonly localeStore = inject(LocaleStore);

  readonly engagement = input.required<Engagement>();

  protected readonly allEvents = signal(false);
  protected readonly screenRows = computed(() =>
    toUsageRows(this.engagement().screens, {
      label: (screen) => screen.label,
      value: (screen) => this.count(screen.value),
      caption: (screen) => this.users(screen.users),
    }),
  );
  protected readonly eventCount = computed(() => this.engagement().events.length);
  protected readonly hiddenEvents = computed(() => this.eventCount() > SHORT_EVENT_LIST);
  protected readonly eventRows = computed(() => {
    const rows = toUsageRows(this.engagement().events, {
      label: (event) => this.eventName(event),
      value: (event) => this.count(event.value),
      caption: (event) => this.eventCaption(event),
    });
    return this.allEvents() ? rows : rows.slice(0, SHORT_EVENT_LIST);
  });

  private eventName(event: EventUsage): string {
    const key = eventLabel(event.label);
    return key === null ? event.label : this.translator.translate(key);
  }

  private eventCaption(event: EventUsage): string {
    const users = this.users(event.users);
    if (eventLabel(event.label) === null) {
      return users;
    }
    return this.translator.translate('dashboard.engagement.eventCaption', {
      name: event.label,
      users,
    });
  }

  private users(value: number): string {
    return this.translator.translate('dashboard.reach.users', { value: this.count(value) });
  }

  private count(value: number): string {
    return formatCount(value, this.localeStore.locale());
  }
}
