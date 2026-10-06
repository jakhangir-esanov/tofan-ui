import { TestBed } from '@angular/core/testing';
import { SubscriptionFilter } from '../../models/subscription-filter';
import { SubscriptionFilters } from './subscription-filters';

const SEARCH_DEBOUNCE_MS = 400;
const USER_ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

describe('SubscriptionFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render(): { emitted: SubscriptionFilter[]; type: (text: string) => void } {
    const fixture = TestBed.createComponent(SubscriptionFilters);
    fixture.componentRef.setInput('trainerOptions', []);
    const emitted: SubscriptionFilter[] = [];
    fixture.componentInstance.filterChange.subscribe((filter) => emitted.push(filter));
    fixture.detectChanges();
    const type = (text: string): void => {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
        '#subscriptionUserId',
      );
      if (input === null) {
        throw new Error('The user id input is missing.');
      }
      input.value = text;
      input.dispatchEvent(new Event('input'));
      TestBed.tick();
    };
    return { emitted, type };
  }

  it('should emit the trimmed user id once when typing settles', () => {
    const { emitted, type } = render();

    type(' 3f2b');
    type(` ${USER_ID} `);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ userId: USER_ID }]);
  });

  it('should not emit when the typed id is not a UUID yet', () => {
    const { emitted, type } = render();

    type('not-a-uuid');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([]);
  });

  it('should keep the last valid filter when the user keeps typing a longer id', () => {
    const { emitted, type } = render();

    type(USER_ID);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    type(`${USER_ID}0`);
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(emitted).toEqual([{ userId: USER_ID }]);
  });
});
