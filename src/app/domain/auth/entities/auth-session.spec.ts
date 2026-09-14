import { AuthSession } from './auth-session';
import { UserProfile } from './user-profile';

describe('AuthSession', () => {
  const user = new UserProfile('1', 'admin', 'Admin', ['admin']);
  const expiresAt = new Date('2026-01-01T12:00:00Z');
  const refreshExpiresAt = new Date('2026-01-02T12:00:00Z');
  const session = new AuthSession(user, 'token', expiresAt, 'refresh', refreshExpiresAt);

  it('is valid before the expiry moment', () => {
    expect(session.isExpired(new Date('2026-01-01T11:59:59Z'))).toBe(false);
  });

  it('is expired from the expiry moment on', () => {
    expect(session.isExpired(expiresAt)).toBe(true);
  });

  it('can be refreshed until the refresh token expires', () => {
    expect(session.canRefresh(new Date('2026-01-02T11:59:59Z'))).toBe(true);
    expect(session.canRefresh(refreshExpiresAt)).toBe(false);
  });

  it('can always be refreshed when the refresh token has no expiry', () => {
    const offline = new AuthSession(user, 'token', expiresAt, 'refresh', null);

    expect(offline.canRefresh(new Date('2100-01-01T00:00:00Z'))).toBe(true);
  });
});
