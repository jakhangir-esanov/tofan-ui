import { TrainerSubscription } from './trainer-subscription';

const now = new Date('2026-10-10T12:00:00Z');

function subscription(endsOn: string, endedOn: string | null): TrainerSubscription {
  return new TrainerSubscription(
    's1',
    't1',
    'Jasur Karimov',
    'u1',
    new Date('2026-09-10T12:00:00Z'),
    new Date(endsOn),
    endedOn === null ? null : new Date(endedOn),
    'a1',
    new Date('2026-09-10T12:00:00Z'),
  );
}

describe('TrainerSubscription', () => {
  it('should be active when it was not ended and its term is still running', () => {
    expect(subscription('2026-11-10T12:00:00Z', null).status(now)).toBe('active');
  });

  it('should be ended when its term has passed', () => {
    expect(subscription('2026-10-01T12:00:00Z', null).status(now)).toBe('ended');
  });

  it('should be ended when it was closed before its term was over', () => {
    expect(subscription('2026-11-10T12:00:00Z', '2026-10-02T12:00:00Z').status(now)).toBe('ended');
  });

  it('should be ended when the term finishes at the exact moment', () => {
    expect(subscription('2026-10-10T12:00:00Z', null).status(now)).toBe('ended');
  });

  it('should allow ending when it is active and refuse when it was closed', () => {
    expect(subscription('2026-11-10T12:00:00Z', null).canEnd(now)).toBe(true);
    expect(subscription('2026-11-10T12:00:00Z', '2026-10-02T12:00:00Z').canEnd(now)).toBe(false);
  });
});
