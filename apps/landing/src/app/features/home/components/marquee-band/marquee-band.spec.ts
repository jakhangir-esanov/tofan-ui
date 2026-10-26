import { TestBed } from '@angular/core/testing';
import { MarqueeBand } from './marquee-band';

describe('MarqueeBand', () => {
  beforeEach(() => localStorage.clear());

  it('should hide the repeated copy from screen readers when rendered', () => {
    const fixture = TestBed.createComponent(MarqueeBand);
    fixture.detectChanges();

    const rows = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.row')];

    expect(rows.map((row) => row.getAttribute('aria-hidden'))).toEqual([null, 'true']);
    expect(rows[0].textContent).toEqual(rows[1].textContent);
    expect(rows[0].textContent).toContain('Mashg‘ulot');
  });
});
