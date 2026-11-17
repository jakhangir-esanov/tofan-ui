import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { ChartPalette, seriesColor } from './chart-palette';

export type ChartKind = 'line' | 'bar';

export interface ChartSeries {
  readonly label: string;
  readonly values: readonly number[];
}

const LINE_TENSION = 0.3;
const LINE_WIDTH = 2;
const BAR_RADIUS = 4;
const MAX_BAR_THICKNESS = 8;
const POINT_HOVER_RADIUS = 4;
const MAX_X_TICKS = 8;
const LEGEND_BOX = 8;

export function toChartData(
  kind: ChartKind,
  labels: readonly string[],
  series: readonly ChartSeries[],
  palette: ChartPalette,
): ChartData<ChartKind> {
  return {
    labels: [...labels],
    datasets: series.map((entry, index) => {
      const color = seriesColor(palette, index);
      return {
        label: entry.label,
        data: [...entry.values],
        borderColor: color,
        backgroundColor: color,
        borderWidth: LINE_WIDTH,
        borderRadius: kind === 'bar' ? BAR_RADIUS : 0,
        maxBarThickness: MAX_BAR_THICKNESS,
        tension: LINE_TENSION,
        pointRadius: 0,
        pointHoverRadius: POINT_HOVER_RADIUS,
      };
    }),
  };
}

export function toChartOptions(
  palette: ChartPalette,
  compact: boolean,
  titles: readonly string[],
): ChartOptions<ChartKind> {
  const axis = { ticks: { color: palette.text }, grid: { color: palette.grid } };
  return {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: !compact,
        labels: { color: palette.text, usePointStyle: true, boxHeight: LEGEND_BOX },
      },
      tooltip: { callbacks: { title: (items) => tooltipTitle(items, titles) } },
    },
    scales: {
      x: {
        ...axis,
        display: !compact,
        grid: { display: false },
        ticks: { ...axis.ticks, maxTicksLimit: MAX_X_TICKS, maxRotation: 0 },
      },
      y: { ...axis, display: !compact, beginAtZero: true, ticks: { ...axis.ticks, precision: 0 } },
    },
  };
}

export function tooltipTitle(
  items: readonly Pick<TooltipItem<ChartKind>, 'dataIndex' | 'label'>[],
  titles: readonly string[],
): string {
  const [first] = items;
  if (first === undefined) {
    return '';
  }
  return titles[first.dataIndex] ?? first.label;
}
