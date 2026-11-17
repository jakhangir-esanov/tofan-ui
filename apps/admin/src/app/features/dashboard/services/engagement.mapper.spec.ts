import { engagementRequests, toEngagement } from './engagement.mapper';
import { report } from './ga4-fixtures';

const SPAN = { from: new Date(2026, 10, 9), to: new Date(2026, 10, 15) };

describe('engagement mapper', () => {
  it('should ask for five reports with the workout and food events when building requests', () => {
    const requests = engagementRequests('soldier', SPAN);

    expect(requests).toHaveLength(5);
    expect(JSON.stringify(requests[2]?.dimensionFilter)).toContain('workout_finished');
    expect(JSON.stringify(requests[3]?.dimensionFilter)).toContain('food_logged');
  });

  it('should weight workout averages by count and drop (not set) events when reports have data', () => {
    const engagement = toEngagement([
      report(['unifiedScreenName'], ['screenPageViews', 'activeUsers'], [['HomeRoute', 50, 20]]),
      report(
        ['eventName'],
        ['eventCount', 'activeUsers'],
        [
          ['login', 7, 5],
          ['(not set)', 0, 3],
        ],
      ),
      report(
        ['customEvent:source'],
        [
          'eventCount',
          'averageCustomEvent:duration_minutes',
          'averageCustomEvent:completed_sets',
          'customEvent:new_personal_records',
        ],
        [
          ['session', 3, 30, 6, 4],
          ['program', 1, 10, 2, 1],
        ],
      ),
      report(['customEvent:source'], ['eventCount'], [['search', 5]]),
      report(['customEvent:meal_type'], ['eventCount'], [['lunch', 5]]),
    ]);

    expect(engagement.screens).toEqual([{ label: 'HomeRoute', value: 50, users: 20 }]);
    expect(engagement.events).toEqual([{ label: 'login', value: 7, users: 5 }]);
    expect(engagement.workouts).toEqual({
      finished: 4,
      averageMinutes: 25,
      averageSets: 5,
      personalRecords: 5,
      bySource: [
        { label: 'session', value: 3 },
        { label: 'program', value: 1 },
      ],
    });
    expect(engagement.foods).toEqual({
      logged: 5,
      bySource: [{ label: 'search', value: 5 }],
      byMealType: [{ label: 'lunch', value: 5 }],
    });
  });

  it('should return no workout or food block when the app sends no such events', () => {
    const engagement = toEngagement([]);

    expect(engagement.workouts).toBeNull();
    expect(engagement.foods).toBeNull();
  });
});
