import { keyEventCount } from './engagement';

describe('engagement', () => {
  it('should return the event count when the event exists and zero otherwise', () => {
    const events = [{ label: 'login', value: 12, users: 9 }];

    expect(keyEventCount(events, 'login')).toBe(12);
    expect(keyEventCount(events, 'sign_up')).toBe(0);
  });
});
