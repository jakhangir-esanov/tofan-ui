import { TestBed } from '@angular/core/testing';
import { Audience } from '../../models/audience';
import { AudienceSummary } from './audience-summary';

const TOTALS = {
  activeUsers: 150,
  newUsers: 0,
  sessions: 300,
  engagementRate: 0.75,
  engagementSecondsPerUser: 90,
  sessionsPerUser: 2,
};

const AUDIENCE: Audience = {
  current: TOTALS,
  previous: { ...TOTALS, activeUsers: 100, newUsers: 0 },
  days: [],
  stickiness: { daily: 10, weekly: 40, monthly: 150, dauPerMau: 0.0667 },
};

describe('AudienceSummary', () => {
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(AudienceSummary);
    fixture.componentRef.setInput('audience', AUDIENCE);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show six cards with the growth against the previous period', () => {
    const element = render();

    expect(element.querySelectorAll('app-kpi-card')).toHaveLength(6);
    expect(element.textContent).toContain('+50%');
    expect(element.textContent).toContain('1 daq 30 s');
  });

  it('should say there is nothing to compare when the previous value is zero', () => {
    const element = render();

    expect(element.textContent).toContain("Oldingi davr bilan solishtirib bo'lmaydi");
  });
});
