export interface ChartPalette {
  readonly series: readonly string[];
  readonly overflow: string;
  readonly text: string;
  readonly grid: string;
  readonly surface: string;
}

export const LIGHT_SERIES_TOKENS: readonly string[] = [
  '--p-primary-500',
  '--p-amber-500',
  '--p-violet-500',
  '--p-rose-500',
  '--p-teal-500',
];

export const DARK_SERIES_TOKENS: readonly string[] = [
  '--p-primary-500',
  '--p-amber-600',
  '--p-violet-500',
  '--p-rose-500',
  '--p-teal-600',
];

const DARK_THEME_CLASS = 'app-dark';
const TEXT_TOKEN = '--p-text-muted-color';
const GRID_TOKEN = '--p-content-border-color';
const SURFACE_TOKEN = '--p-content-background';

export function readChartPalette(root: HTMLElement): ChartPalette {
  const style = getComputedStyle(root);
  const token = (name: string): string => style.getPropertyValue(name).trim();
  const series = root.classList.contains(DARK_THEME_CLASS)
    ? DARK_SERIES_TOKENS
    : LIGHT_SERIES_TOKENS;
  return {
    series: series.map(token),
    overflow: token(TEXT_TOKEN),
    text: token(TEXT_TOKEN),
    grid: token(GRID_TOKEN),
    surface: token(SURFACE_TOKEN),
  };
}

export function seriesColor(palette: ChartPalette, index: number): string {
  return palette.series[index] ?? palette.overflow;
}
