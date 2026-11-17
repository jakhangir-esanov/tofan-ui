export const GA4_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GA4_READONLY_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
export const GA4_JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

const TOKEN_LIFETIME_SECONDS = 3600;
const PEM_LINE = /-----(BEGIN|END) PRIVATE KEY-----|\s/g;
const SIGNING_ALGORITHM = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;

export interface Ga4JwtClaims {
  readonly iss: string;
  readonly scope: string;
  readonly aud: string;
  readonly iat: number;
  readonly exp: number;
}

export function ga4JwtClaims(clientEmail: string, issuedAt: number): Ga4JwtClaims {
  return {
    iss: clientEmail,
    scope: GA4_READONLY_SCOPE,
    aud: GA4_TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + TOKEN_LIFETIME_SECONDS,
  };
}

export async function signGa4Jwt(
  claims: Ga4JwtClaims,
  privateKeyPem: string,
  subtle: SubtleCrypto,
): Promise<string> {
  const key = await subtle.importKey('pkcs8', pemBody(privateKeyPem), SIGNING_ALGORITHM, false, [
    'sign',
  ]);
  const unsigned = `${base64UrlText(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64UrlText(JSON.stringify(claims))}`;
  const signature = await subtle.sign(SIGNING_ALGORITHM, key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64UrlBytes(new Uint8Array(signature))}`;
}

export function pemBody(pem: string): ArrayBuffer {
  const binary = atob(pem.replace(PEM_LINE, ''));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function base64UrlText(text: string): string {
  return base64UrlBytes(new TextEncoder().encode(text));
}

function base64UrlBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
