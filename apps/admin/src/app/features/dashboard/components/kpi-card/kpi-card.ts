import { Component, input } from '@angular/core';

export type ChangeTone = 'up' | 'down' | 'flat';

@Component({
  selector: 'app-kpi-card',
  host: { class: 'block min-w-0' },
  templateUrl: './kpi-card.html',
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly change = input<string>();
  readonly tone = input<ChangeTone>('flat');
  readonly hint = input<string>();
}
