import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { SoldierOption } from './models/soldier-option';
import { SoldierLookupService } from './services/soldier-lookup.service';
import { SoldierSearchStore } from './soldier-search.store';

const ali: SoldierOption = { userId: 'u1', label: 'Ali Valiyev', userName: 'ali_v' };
const vali: SoldierOption = { userId: 'u2', label: 'Vali Aliyev', userName: 'vali_a' };

describe('SoldierSearchStore', () => {
  let lookup: Pick<SoldierLookupService, 'search'>;

  function createStore(): SoldierSearchStore {
    TestBed.configureTestingModule({
      providers: [SoldierSearchStore, { provide: SoldierLookupService, useValue: lookup }],
    });
    return TestBed.inject(SoldierSearchStore);
  }

  beforeEach(() => {
    lookup = { search: vi.fn().mockResolvedValue([ali, vali]) };
  });

  it('should ask for the first ten soldiers when the text is empty', async () => {
    const store = createStore();

    await store.search('');

    expect(lookup.search).toHaveBeenCalledWith('', 10);
    expect(store.options()).toEqual([ali, vali]);
    expect(store.loading()).toBe(false);
  });

  it('should send the trimmed text when the admin types a name', async () => {
    const store = createStore();

    await store.search('  ali ');

    expect(lookup.search).toHaveBeenCalledWith('ali', 10);
  });

  it('should keep the newest answer when an older search finishes later', async () => {
    let finishOlder: (found: readonly SoldierOption[]) => void = () => undefined;
    vi.mocked(lookup.search)
      .mockImplementationOnce(
        () => new Promise<readonly SoldierOption[]>((resolve) => (finishOlder = resolve)),
      )
      .mockResolvedValueOnce([vali]);
    const store = createStore();

    const older = store.search('a');
    await store.search('vali');
    finishOlder([ali]);
    await older;

    expect(store.options()).toEqual([vali]);
    expect(store.loading()).toBe(false);
  });

  it('should clear the options and flag the failure when the search fails', async () => {
    const store = createStore();
    await store.search('');
    vi.mocked(lookup.search).mockRejectedValue(new ServiceUnavailableError());

    await store.search('ali');

    expect(store.options()).toEqual([]);
    expect(store.failed()).toBe(true);
  });

  it('should clear the failure flag when a later search succeeds', async () => {
    vi.mocked(lookup.search).mockRejectedValueOnce(new ServiceUnavailableError());
    const store = createStore();
    await store.search('ali');

    await store.search('ali');

    expect(store.failed()).toBe(false);
    expect(store.options()).toEqual([ali, vali]);
  });
});
