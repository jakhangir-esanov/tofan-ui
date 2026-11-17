import { eventLabel, mealTypeLabel, sourceLabel } from './analytics-labels';

describe('analytics labels', () => {
  it('should return a key when the source is known and null otherwise', () => {
    expect(sourceLabel('photo_scan')).toBe('dashboard.sources.photoScan');
    expect(sourceLabel('teleport')).toBeNull();
  });

  it('should reuse the meal type labels when the value is a meal type', () => {
    expect(mealTypeLabel('preWorkout')).toBe('enums.mealType.preWorkout');
    expect(mealTypeLabel('brunch')).toBeNull();
  });

  it('should name key and common events and leave custom ones raw', () => {
    expect(eventLabel('login')).toBe('dashboard.engagement.logins');
    expect(eventLabel('first_open')).toBe('dashboard.eventNames.first_open');
    expect(eventLabel('story_cta_tapped')).toBeNull();
  });
});
