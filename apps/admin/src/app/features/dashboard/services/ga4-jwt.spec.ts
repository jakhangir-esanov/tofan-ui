import { GA4_READONLY_SCOPE, GA4_TOKEN_URL, ga4JwtClaims, pemBody, signGa4Jwt } from './ga4-jwt';

const ALGORITHM = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;

async function generatePem(): Promise<{ pem: string; publicKey: CryptoKey }> {
  const pair = await crypto.subtle.generateKey(
    { ...ALGORITHM, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ['sign', 'verify'],
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  const base64 = btoa(String.fromCharCode(...pkcs8));
  const pem = `-----BEGIN PRIVATE KEY-----\n${base64.replace(/(.{64})/g, '$1\n')}\n-----END PRIVATE KEY-----\n`;
  return { pem, publicKey: pair.publicKey };
}

function decodePart(part: string): unknown {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(padded)) as unknown;
}

function decodeBytes(part: string): ArrayBuffer {
  const binary = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
}

describe('ga4 jwt', () => {
  it('should ask for read-only analytics for one hour when building the claims', () => {
    expect(ga4JwtClaims('reader@tofan.iam.gserviceaccount.com', 1000)).toEqual({
      iss: 'reader@tofan.iam.gserviceaccount.com',
      scope: GA4_READONLY_SCOPE,
      aud: GA4_TOKEN_URL,
      iat: 1000,
      exp: 4600,
    });
  });

  it('should produce an RS256 token the public key verifies when signing with a PEM key', async () => {
    const { pem, publicKey } = await generatePem();
    const claims = ga4JwtClaims('reader@tofan.iam.gserviceaccount.com', 1000);

    const jwt = await signGa4Jwt(claims, pem, crypto.subtle);

    const [header = '', payload = '', signature = ''] = jwt.split('.');
    expect(decodePart(header)).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(decodePart(payload)).toEqual(claims);
    const valid = await crypto.subtle.verify(
      ALGORITHM,
      publicKey,
      decodeBytes(signature),
      new TextEncoder().encode(`${header}.${payload}`),
    );
    expect(valid).toBe(true);
  });

  it('should drop the PEM armour and line breaks when reading the key body', () => {
    const bytes = new Uint8Array(
      pemBody('-----BEGIN PRIVATE KEY-----\nAQID\n-----END PRIVATE KEY-----\n'),
    );

    expect([...bytes]).toEqual([1, 2, 3]);
  });
});
