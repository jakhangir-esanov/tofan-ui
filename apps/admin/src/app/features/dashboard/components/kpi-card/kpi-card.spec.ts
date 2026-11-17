import { TestBed } from '@angular/core/testing';
import { KpiCard } from './kpi-card';

describe('KpiCard', () => {
  it('should show the label, value and a green upward change when the tone is up', () => {
    const fixture = TestBed.createComponent(KpiCard);
    fixture.componentRef.setInput('label', 'Active users');
    fixture.componentRef.setInput('value', '1 449');
    fixture.componentRef.setInput('change', '+48.2%');
    fixture.componentRef.setInput('tone', 'up');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Active users');
    expect(element.textContent).toContain('1 449');
    expect(element.querySelector('.text-green-600')?.textContent).toContain('+48.2%');
    expect(element.querySelector('.pi-arrow-up-right')).not.toBeNull();
  });

  it('should hide the change line when there is no change', () => {
    const fixture = TestBed.createComponent(KpiCard);
    fixture.componentRef.setInput('label', 'DAU / MAU');
    fixture.componentRef.setInput('value', '4.9%');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('span')).toHaveLength(1);
  });
});
