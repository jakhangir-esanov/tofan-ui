import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { DashboardStore } from './dashboard.store';
import { Audience, AudienceTotals } from './models/audience';
import { Engagement } from './models/engagement';
import { Reach } from './models/reach';
import { Realtime } from './models/realtime';
import { AnalyticsService } from './services/analytics.service';

const TOTALS: AudienceTotals = {
  activeUsers: 10,
  newUsers: 2,
  sessions: 30,
  engagementRate: 0.7,
  engagementSecondsPerUser: 120,
  sessionsPerUser: 3,
};
const AUDIENCE: Audience = {
  current: TOTALS,
  previous: TOTALS,
  days: [],
  stickiness: { daily: 1, weekly: 5, monthly: 10, dauPerMau: 0.1 },
};
const REACH: Reach = {
  platforms: [],
  versions: [],
  operatingSystems: [],
  devices: [],
  countries: [],
};
const ENGAGEMENT: Engagement = { screens: [], events: [], workouts: null, foods: null };
const REALTIME: Realtime = { activeUsers: 3, perMinute: [], platforms: [] };
const NOW = new Date(2026, 10, 16, 10);

type AnalyticsDouble = Pick<
  AnalyticsService,
  'audience' | 'reach' | 'engagement' | 'retention' | 'realtime'
>;

describe('DashboardStore', () => {
  let service: AnalyticsDouble;

  function createStore(): DashboardStore {
    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: AnalyticsService, useValue: service }],
    });
    return TestBed.inject(DashboardStore);
  }

  beforeEach(() => {
    service = {
      audience: vi.fn().mockResolvedValue(AUDIENCE),
      reach: vi.fn().mockResolvedValue(REACH),
      engagement: vi.fn().mockResolvedValue(ENGAGEMENT),
      retention: vi.fn().mockResolvedValue([]),
      realtime: vi.fn().mockResolvedValue(REALTIME),
    };
  });

  it('should load every block for the soldier app and 28 days when it loads first', async () => {
    const store = createStore();

    await store.load(NOW);

    const span = { from: new Date(2026, 9, 19), to: new Date(2026, 10, 15) };
    expect(service.audience).toHaveBeenCalledWith('soldier', span);
    expect(service.reach).toHaveBeenCalledWith('soldier', span);
    expect(store.audience()).toEqual(AUDIENCE);
    expect(store.realtime()).toEqual(REALTIME);
    expect(store.failed()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.span()).toEqual(span);
    expect(store.previousSpan()).toEqual({
      from: new Date(2026, 8, 21),
      to: new Date(2026, 9, 18),
    });
    expect(store.realtimeAt()).toBeInstanceOf(Date);
  });

  it('should keep the blocks that loaded and flag a failure when one block fails', async () => {
    vi.mocked(service.reach).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.load(NOW);

    expect(store.failed()).toBe(true);
    expect(store.reach()).toBeNull();
    expect(store.audience()).toEqual(AUDIENCE);
  });

  it('should report empty when the period has no active users', async () => {
    vi.mocked(service.audience).mockResolvedValue({
      ...AUDIENCE,
      current: { ...TOTALS, activeUsers: 0 },
    });
    const store = createStore();

    await store.load(NOW);

    expect(store.empty()).toBe(true);
  });

  it('should clear old data and reload for the trainer app when the app changes', async () => {
    const store = createStore();
    await store.load(NOW);
    vi.mocked(service.audience).mockReturnValue(new Promise(() => undefined));

    void store.selectApp('trainer');

    expect(store.app()).toBe('trainer');
    expect(store.audience()).toBeNull();
    expect(vi.mocked(service.audience).mock.calls.at(-1)?.[0]).toBe('trainer');
  });

  it('should ignore an older answer when a newer load has started', async () => {
    let answerFirst: (value: Audience) => void = () => undefined;
    vi.mocked(service.audience).mockReturnValueOnce(
      new Promise<Audience>((resolve) => {
        answerFirst = resolve;
      }),
    );
    const store = createStore();
    const first = store.load(NOW);
    const newer = { ...AUDIENCE, stickiness: { ...AUDIENCE.stickiness, daily: 99 } };
    vi.mocked(service.audience).mockResolvedValueOnce(newer);
    await store.load(NOW);

    answerFirst(AUDIENCE);
    await first;

    expect(store.audience()).toEqual(newer);
  });

  it('should keep the dashboard and hide realtime when a realtime refresh fails', async () => {
    const store = createStore();
    await store.load(NOW);
    vi.mocked(service.realtime).mockRejectedValue(new ServiceUnavailableError());

    await store.refreshRealtime();

    expect(store.realtime()).toBeNull();
    expect(store.audience()).toEqual(AUDIENCE);
  });

  it('should keep the page warning off when only realtime fails', async () => {
    vi.mocked(service.realtime).mockRejectedValue(new ServiceUnavailableError());
    const store = createStore();

    await store.load(NOW);

    expect(store.failed()).toBe(false);
    expect(store.realtime()).toBeNull();
    expect(store.audience()).toEqual(AUDIENCE);
  });
});
