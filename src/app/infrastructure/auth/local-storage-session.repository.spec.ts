import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { LocalStorageSessionRepository, SESSION_STORAGE } from './local-storage-session.repository';

function fakeJwt(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/=+$/, '');
  return `eyJhbGciOiJub25lIn0.${payload}.signature`;
}

describe('LocalStorageSessionRepository', () => {
  const accessToken = fakeJwt({
    sub: '7',
    preferred_username: 'admin',
    name: 'Admin',
    realm_access: { roles: ['admin'] },
  });
  const user = new UserProfile('7', 'admin', 'Admin', ['admin']);

  let storage: Storage;
  let repository: LocalStorageSessionRepository;

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };

    TestBed.configureTestingModule({
      providers: [LocalStorageSessionRepository, { provide: SESSION_STORAGE, useValue: storage }],
    });
    repository = TestBed.inject(LocalStorageSessionRepository);
  });

  it('restores a saved session together with its user', () => {
    const session = new AuthSession(
      user,
      accessToken,
      new Date('2030-01-01T00:00:00Z'),
      'refresh',
      new Date('2030-02-01T00:00:00Z'),
    );

    repository.save(session);

    expect(repository.get()).toEqual(session);
  });

  it('returns null after clearing', () => {
    repository.save(new AuthSession(user, accessToken, new Date('2030-01-01'), 'refresh', null));

    repository.clear();

    expect(repository.get()).toBeNull();
  });

  it('discards corrupted data', () => {
    storage.setItem('tofan.session', '{"accessToken": 42}');

    expect(repository.get()).toBeNull();
    expect(storage.length).toBe(0);
  });

  it('discards a session whose token carries no user', () => {
    repository.save(new AuthSession(user, 'opaque', new Date('2030-01-01'), 'refresh', null));

    expect(repository.get()).toBeNull();
    expect(storage.length).toBe(0);
  });
});
