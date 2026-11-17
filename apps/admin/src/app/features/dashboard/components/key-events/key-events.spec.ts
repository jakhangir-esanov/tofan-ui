import { TestBed } from '@angular/core/testing';
import { EventUsage } from '../../models/engagement';
import { KeyEvents } from './key-events';

describe('KeyEvents', () => {
  function render(events: readonly EventUsage[]): HTMLElement {
    const fixture = TestBed.createComponent(KeyEvents);
    fixture.componentRef.setInput('events', events);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show only the key events the app sent', () => {
    const element = render([
      { label: 'login', value: 22, users: 16 },
      { label: 'screen_view', value: 1200, users: 38 },
    ]);

    expect(element.querySelectorAll('app-kpi-card')).toHaveLength(1);
    expect(element.textContent).toContain('Tizimga kirish');
  });

  it('should render nothing when no key event was sent', () => {
    const element = render([{ label: 'screen_view', value: 5, users: 2 }]);

    expect(element.querySelector('section')).toBeNull();
  });
});
