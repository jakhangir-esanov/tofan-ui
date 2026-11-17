import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LONG_PRESS_MS, MessagePress } from './message-press';

@Component({
  imports: [MessagePress],
  template: `<div coachMessagePress (menuRequested)="menus = menus + 1">
    <button type="button" (click)="clicks = clicks + 1">photo</button>
  </div>`,
})
class PressHost {
  menus = 0;
  clicks = 0;
}

function pointer(type: string, pointerType: string, x = 0, y = 0): Event {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    isPrimary: { value: true },
  });
  return event;
}

describe('MessagePress', () => {
  let fixture: ComponentFixture<PressHost>;

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(PressHost);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  function target(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(
      '[coachMessagePress]',
    ) as HTMLElement;
  }

  function button(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
  }

  it('should ask for the menu and block the browser menu when the message is right clicked', () => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

    target().dispatchEvent(event);

    expect(fixture.componentInstance.menus).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should ask for the menu every time the message is right clicked', () => {
    target().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    target().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    button().click();

    expect(fixture.componentInstance.menus).toBe(2);
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('should ask for the menu once and swallow the following tap when a finger holds the message', () => {
    button().dispatchEvent(pointer('pointerdown', 'touch'));
    vi.advanceTimersByTime(LONG_PRESS_MS);
    target().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    button().dispatchEvent(pointer('pointerup', 'touch'));
    button().click();

    expect(fixture.componentInstance.menus).toBe(1);
    expect(fixture.componentInstance.clicks).toBe(0);
  });

  it('should not ask for the menu when the finger lifts or scrolls before the hold time', () => {
    button().dispatchEvent(pointer('pointerdown', 'touch'));
    vi.advanceTimersByTime(LONG_PRESS_MS - 100);
    button().dispatchEvent(pointer('pointerup', 'touch'));
    button().dispatchEvent(pointer('pointerdown', 'touch', 0, 0));
    button().dispatchEvent(pointer('pointermove', 'touch', 0, 40));
    vi.advanceTimersByTime(LONG_PRESS_MS);
    button().click();

    expect(fixture.componentInstance.menus).toBe(0);
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('should leave a held mouse button to the normal click', () => {
    button().dispatchEvent(pointer('pointerdown', 'mouse'));
    vi.advanceTimersByTime(LONG_PRESS_MS);
    button().click();

    expect(fixture.componentInstance.menus).toBe(0);
    expect(fixture.componentInstance.clicks).toBe(1);
  });
});
