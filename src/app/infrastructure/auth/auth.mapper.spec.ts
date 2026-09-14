import { toAuthSession, userFromAccessToken } from './auth.mapper';

function fakeJwt(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/=+$/, '');
  return `eyJhbGciOiJub25lIn0.${payload}.signature`;
}

describe('auth mapper', () => {
  const accessToken = fakeJwt({
    sub: 'b3c1',
    preferred_username: 'jakhangir',
    name: 'Jakhangir Esanov',
    realm_access: { roles: ['offline_access', 'admin'] },
  });

  it('derives both expiry dates from the token lifetimes', () => {
    const issuedAt = new Date('2026-01-01T12:00:00Z');

    const session = toAuthSession(
      {
        accessToken,
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshExpiresIn: 7200,
      },
      issuedAt,
    );

    expect(session?.accessToken).toBe(accessToken);
    expect(session?.refreshToken).toBe('refresh');
    expect(session?.expiresAt.toISOString()).toBe('2026-01-01T13:00:00.000Z');
    expect(session?.refreshExpiresAt?.toISOString()).toBe('2026-01-01T14:00:00.000Z');
  });

  it('treats a zero refresh lifetime as unlimited', () => {
    const session = toAuthSession({
      accessToken,
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshExpiresIn: 0,
    });

    expect(session?.refreshExpiresAt).toBeNull();
  });

  it('reads the user from the Keycloak claims', () => {
    const user = userFromAccessToken(accessToken);

    expect(user?.id).toBe('b3c1');
    expect(user?.username).toBe('jakhangir');
    expect(user?.fullName).toBe('Jakhangir Esanov');
    expect(user?.isAdmin()).toBe(true);
  });

  it('falls back to the username when the token has no name', () => {
    const user = userFromAccessToken(fakeJwt({ sub: '1', preferred_username: 'soldier' }));

    expect(user?.fullName).toBe('soldier');
    expect(user?.isAdmin()).toBe(false);
  });

  it('rejects a token without user claims', () => {
    expect(userFromAccessToken('not-a-jwt')).toBeNull();
    expect(userFromAccessToken(fakeJwt({ scope: 'openid' }))).toBeNull();
  });
});
