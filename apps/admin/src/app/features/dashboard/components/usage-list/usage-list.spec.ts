import { TestBed } from '@angular/core/testing';
import { UsageRow } from '../../models/usage';
import { UsageList } from './usage-list';

describe('UsageList', () => {
  function render(rows: readonly UsageRow[]): HTMLElement {
    const fixture = TestBed.createComponent(UsageList);
    fixture.componentRef.setInput('rows', rows);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show every row and scale bars to the largest row when rows are given', () => {
    const element = render([
      {
        key: 'a',
        label: 'Android',
        value: '30',
        caption: 'crash-free',
        share: 0.6,
        placeholder: null,
      },
      {
        key: 'b',
        label: 'iOS',
        value: '20',
        caption: '',
        share: 0.4,
        placeholder: 'dashboard.states.other',
      },
    ]);

    const bars = Array.from(element.querySelectorAll<HTMLElement>('li .bg-primary'));
    expect(element.textContent).toContain('Android');
    expect(element.textContent).toContain('crash-free');
    expect(element.textContent).toContain('Boshqa');
    expect(element.textContent).not.toContain('iOS');
    expect(bars.map((bar) => bar.style.width)).toEqual(['100%', `${(0.4 / 0.6) * 100}%`]);
  });

  it('should show the no data text when there are no rows', () => {
    const element = render([]);

    expect(element.querySelectorAll('li')).toHaveLength(0);
    expect(element.textContent).toContain("Ma'lumot yo'q");
  });
});
