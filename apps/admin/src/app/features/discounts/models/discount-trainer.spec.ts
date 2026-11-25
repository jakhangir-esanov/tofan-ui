import { trainerNamesOf } from './discount-trainer';

describe('trainerNamesOf', () => {
  it('should show the coach names in the given order and the id when a coach is unknown', () => {
    const trainers = [
      { id: 'a', displayName: 'Aziz' },
      { id: 'b', displayName: 'Bekzod' },
    ];

    expect(trainerNamesOf(['b', 'x', 'a'], trainers)).toEqual(['Bekzod', 'x', 'Aziz']);
  });
});
