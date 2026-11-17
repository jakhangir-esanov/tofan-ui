import { ChartPalette, seriesColor } from './chart-palette';
import { toChartData, toChartOptions, tooltipTitle } from './chart-config';

const PALETTE: ChartPalette = {
  series: ['first', 'second'],
  overflow: 'muted',
  text: 'muted',
  grid: 'border',
  surface: 'surface',
};

describe('chart config', () => {
  it('should color each series in palette order when the chart is a line', () => {
    const data = toChartData(
      'line',
      ['Mon', 'Tue'],
      [
        { label: 'Active', values: [1, 2] },
        { label: 'New', values: [0, 1] },
      ],
      PALETTE,
    );

    expect(data.labels).toEqual(['Mon', 'Tue']);
    expect(data.datasets.map((dataset) => dataset.borderColor)).toEqual(['first', 'second']);
  });

  it('should fold series past the palette into the neutral color instead of cycling', () => {
    expect(seriesColor(PALETTE, 2)).toBe('muted');
  });

  it('should hide the legend and axes when the chart is compact', () => {
    const options = toChartOptions(PALETTE, true, []);

    expect(options.plugins?.legend?.display).toBe(false);
    expect(options.scales?.['x']?.display).toBe(false);
  });

  it('should show the full title in the tooltip when titles are given', () => {
    expect(tooltipTitle([{ dataIndex: 0, label: '15.11' }], ['15 November 2026'])).toBe(
      '15 November 2026',
    );
    expect(tooltipTitle([{ dataIndex: 3, label: '18.11' }], [])).toBe('18.11');
    expect(tooltipTitle([], [])).toBe('');
  });
});
