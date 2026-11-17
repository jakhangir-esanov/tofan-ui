import backendProxy from '../../proxy.prod.conf.json' with { type: 'json' };
import { GA4_CREDENTIALS_ROUTE, ga4CredentialsEntry } from './ga4.mjs';

export default {
  [GA4_CREDENTIALS_ROUTE]: ga4CredentialsEntry(backendProxy['/api']),
  ...backendProxy,
};
