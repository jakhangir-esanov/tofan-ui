import { Component, DOCUMENT, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { UIChart } from '@openng/optimus-ui/chart';
import { ChartKind, ChartSeries, toChartData, toChartOptions } from './chart-config';
import { readChartPalette } from './chart-palette';

const DEFAULT_HEIGHT = '16rem';

@Component({
  selector: 'app-chart',
  imports: [UIChart],
  template: `
    <p-chart
      [type]="kind()"
      [data]="data()"
      [options]="options()"
      [height]="height()"
      [ariaLabel]="ariaLabel()"
    />
  `,
})
export class Chart {
  private readonly document = inject(DOCUMENT);
  private readonly palette = signal(readChartPalette(this.document.documentElement));

  readonly kind = input.required<ChartKind>();
  readonly labels = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  readonly height = input(DEFAULT_HEIGHT);
  readonly ariaLabel = input<string>();
  readonly compact = input(false);
  readonly titles = input<readonly string[]>([]);

  protected readonly data = computed(() =>
    toChartData(this.kind(), this.labels(), this.series(), this.palette()),
  );
  protected readonly options = computed(() =>
    toChartOptions(this.palette(), this.compact(), this.titles()),
  );

  constructor() {
    const observer = new MutationObserver(() => this.refreshPalette());
    observer.observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    observer.observe(this.document.head, { childList: true, subtree: true, characterData: true });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  private refreshPalette(): void {
    this.palette.set(readChartPalette(this.document.documentElement));
  }
}
