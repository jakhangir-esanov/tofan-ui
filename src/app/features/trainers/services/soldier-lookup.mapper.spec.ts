import { SoldierLookupResponse } from './soldier-lookup.dto';
import { toSoldierOption, toSoldierSearchQuery } from './soldier-lookup.mapper';

const response: SoldierLookupResponse = {
  userId: 'u1',
  firstName: 'Ali',
  lastName: 'Valiyev',
  userName: 'ali_v',
};

describe('toSoldierOption', () => {
  it('should join the first and the last name into the label', () => {
    expect(toSoldierOption(response)).toEqual({
      userId: 'u1',
      label: 'Ali Valiyev',
      userName: 'ali_v',
    });
  });

  it('should fall back to the username when the name is empty', () => {
    expect(toSoldierOption({ ...response, firstName: '', lastName: ' ' }).label).toBe('ali_v');
  });
});

describe('toSoldierSearchQuery', () => {
  it('should ask for the first rows without a search when the text is empty', () => {
    expect(toSoldierSearchQuery('', 10)).toEqual({ First: 0, Rows: 10, Search: undefined });
  });

  it('should send the text as the search when it is not empty', () => {
    expect(toSoldierSearchQuery('ali', 10)).toEqual({ First: 0, Rows: 10, Search: 'ali' });
  });
});
