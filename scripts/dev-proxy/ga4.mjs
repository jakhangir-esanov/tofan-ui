import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_KEY_FILE = join(homedir(), '.config', 'tofan', 'ga4-key.json');
const DEFAULT_PROPERTY_ID = '553445328';
const LOG_PREFIX = '[ga4-credentials]';

export const GA4_CREDENTIALS_ROUTE = '/api/admin/analytics/ga4-credentials';

export function ga4CredentialsEntry(backendEntry) {
  return { ...backendEntry, bypass: answerFromLocalKey };
}

async function answerFromLocalKey(req, res) {
  if (req.method !== 'GET' || (req.url ?? '').split('?')[0] !== GA4_CREDENTIALS_ROUTE) {
    return undefined;
  }
  const key = await readLocalKey();
  if (key === null) {
    return undefined;
  }
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(
    JSON.stringify({
      clientEmail: key.client_email,
      privateKey: key.private_key,
      propertyId: process.env['TOFAN_GA4_PROPERTY_ID'] ?? DEFAULT_PROPERTY_ID,
    }),
  );
  return req.url;
}

async function readLocalKey() {
  const path = process.env['TOFAN_GA4_KEY_FILE'] ?? DEFAULT_KEY_FILE;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    console.warn(`${LOG_PREFIX} no key at ${path}, asking the backend`);
    return null;
  }
}
