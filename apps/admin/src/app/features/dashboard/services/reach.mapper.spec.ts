import { report } from './ga4-fixtures';
import { toReach } from './reach.mapper';

describe('reach mapper', () => {
  it('should map every breakdown and skip (not set) parts when reports have data', () => {
    const reach = toReach([
      report(['platform'], ['activeUsers'], [['Android', 10]]),
      report(['appVersion'], ['activeUsers', 'crashFreeUsersRate'], [['2.5.1', 8, 0.99]]),
      report(['operatingSystem', 'operatingSystemVersion'], ['activeUsers'], [['iOS', '18.1', 4]]),
      report(
        ['mobileDeviceBranding', 'mobileDeviceMarketingName'],
        ['activeUsers'],
        [['Samsung', '(not set)', 3]],
      ),
      report(['countryId', 'country'], ['activeUsers'], [['UZ', 'Uzbekistan', 9]]),
    ]);

    expect(reach).toEqual({
      platforms: [{ label: 'Android', value: 10 }],
      versions: [{ label: '2.5.1', value: 8, crashFreeRate: 0.99 }],
      operatingSystems: [{ label: 'iOS 18.1', value: 4 }],
      devices: [{ label: 'Samsung', value: 3 }],
      countries: [{ code: 'UZ', label: 'Uzbekistan', value: 9 }],
    });
  });
});
