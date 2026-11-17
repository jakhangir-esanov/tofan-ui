import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-panel',
  host: { class: 'block min-w-0' },
  template: `
    <section
      class="border-surface-200 dark:border-surface-700 flex h-full flex-col gap-4 rounded-xl border p-4"
    >
      <header class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="m-0 text-base font-semibold">{{ heading() }}</h2>
          @if (hint(); as text) {
            <p class="text-muted-color m-0 text-xs">{{ text }}</p>
          }
        </div>
        <ng-content select="[panelAction]" />
      </header>
      <ng-content />
    </section>
  `,
})
export class DashboardPanel {
  readonly heading = input.required<string>();
  readonly hint = input<string>();
}
