# Dashboard feature

## Purpose

The admin home page shows mobile app analytics from Firebase Analytics (GA4 property `553445328`).
The admin picks the app (Soldier or Trainer) and the period (7, 28 or 90 days); every period ends yesterday.
The header (title, the period and comparison dates, app and period filters, section tabs) stays on top while the page scrolls.
Four tabs split the content:

- Overview: KPI cards with the change against the previous period of the same length, daily activity (chart or table), users in the app now, key actions.
- Behaviour: top screens, events (top 10, all on demand, known names translated), workouts, food entries.
- Technology: platforms, app versions with crash-free share, countries, operating systems, devices.
- Retention: weekly cohorts.

## Backend

The panel talks to GA4 itself; the backend only hands over the key (owner decision, 2026-11-16).

- `GET /admin/analytics/ga4-credentials` (`Policies.Admin`) returns `{ clientEmail, privateKey, propertyId }` read from the backend `.env`.
  This endpoint does not exist yet on stage or production; until it does, the deployed dashboard shows the "could not load" message.
- `services/ga4-client.service.ts` keeps the credentials in memory only (never in storage), signs an RS256 JWT with WebCrypto (`services/ga4-jwt.ts`), trades it at `https://oauth2.googleapis.com/token` for a read-only access token and reuses that token until 5 minutes before it expires; parallel reports share one token request.
- Reports go straight to `https://analyticsdata.googleapis.com/v1beta/properties/<id>:<method>` (`batchRunReports` for the audience, reach and engagement blocks, `runReport` for retention, `runRealtimeReport` twice for realtime).
- Google calls use an `HttpClient` built on `HttpBackend`, so the app interceptors never see them: the Keycloak token is not sent to Google, and a Google `401` or `403` cannot renew the session or open the access denied page.
  A `401` from Google drops the token and retries once; any other failure becomes `ServiceUnavailableError` with code `Analytics.Unavailable`.

Known trade-offs of this choice:

- Every admin browser receives the service account private key. It stays valid until the key is deleted in Google Cloud, so rotate it when an admin leaves or a browser is compromised. The account only has the Viewer role on property `553445328`.
- There is no shared cache: every page load spends GA4 quota (about 5 requests, plus 2 realtime requests every 2 minutes while the tab is visible). Realtime has its own hourly project quota; when it runs out (`429`), only the realtime panel hides until the next refresh.
- The two Google hosts are hard-coded in `services/`, an exception to the `API_BASE_URL` rule.

### Local development

`npm start`, `npm run start:staging` and `npm run start:prod` load `scripts/dev-proxy/admin.<env>.mjs`.
It answers `GET /api/admin/analytics/ga4-credentials` from a local key file, and passes the request to the backend when the file is missing.

| Env variable            | Default                        | Purpose                  |
| ----------------------- | ------------------------------ | ------------------------ |
| `TOFAN_GA4_KEY_FILE`    | `~/.config/tofan/ga4-key.json` | service account JSON key |
| `TOFAN_GA4_PROPERTY_ID` | `553445328`                    | GA4 property             |

The service account is `tofan-analytics-reader@tofan-68065.iam.gserviceaccount.com`. Never commit the key.

## GA4 facts the code depends on

- Streams: Soldier Android `15747799186`, Soldier iOS `15747727917`, Trainer Android `16101106871`, Trainer iOS `16105759556`, Trainer web `16252205625` (`services/ga4-streams.ts`).
- Every report filters by stream only, like the Firebase console.
  A user-scoped filter such as `customUser:environment != dev` is applied inconsistently by GA4: the same events counted 226 by `eventName` and 235 by `customEvent:source`, and cohort week 0 came out larger than the cohort.
  The `environment` user property is also `(not set)` for more than half of the users, so `environment = prod` would drop real users.
  Dev builds are counted; on 2026-11-16 that was 1 Soldier user and about 12 Trainer users.
- Cohorts must be continuous weeks; retention asks for the 8 complete Monday to Sunday weeks before the current week.
- Workout and food blocks read the registered custom definitions `source`, `meal_type`, `duration_minutes`, `completed_sets` and `new_personal_records`.
  A block is hidden when its event (`workout_finished`, `food_logged`) has no rows, which is the case for the Trainer app.
- Standard reports lag 24-48 hours; realtime covers the last 30 minutes and refreshes every 2 minutes while the tab is visible.

## Screens

| Route | Page                                         | Access                   |
| ----- | -------------------------------------------- | ------------------------ |
| `/`   | `pages/dashboard-page` (`DashboardStore`)    | `authGuard` (admin role) |

## Structure notes

- `DashboardStore` loads five blocks in parallel; a failed report block is `null` and sets `failed`, the others still render. A realtime failure only hides the realtime panel.
  A load counter drops answers from an older load after the app or period changed.
- `models/` hold plain data and pure rules: period spans, cohort weeks, retention rate, relative change, usage rows, number formatting, labels.
- `services/ga4-table.ts` reads a GA4 report by header name, so mappers never depend on column order.
- Components are presentational: `audience-summary`, `activity-trend`, `realtime-panel`, `key-events`, `engagement-panels`, `activity-panels`, `reach-panels`, `retention-table`, with `kpi-card`, `usage-list` and `dashboard-panel` (heading, hint and a `[panelAction]` slot) as building blocks.
- A KPI shows a percent change only when the previous period had at least 30 active users (`isComparable`); below that it shows the previous value, so a jump from 2 to 38 users is not shown as +1 800%.
- Blocks without data are hidden: key action cards with zero events, the workout and food panels for the Trainer app, the realtime chart when nobody is online.
- While a reload runs the content stays on screen at half opacity with a spinner by the title, instead of a skeleton flash.
- Dates: Uzbek dates are built by hand (`15.11`, `15.11.2026`) because browsers and Node format `uz-UZ` differently; Russian and English use `Intl` (`19 окт.`, `19 Oct`).
- Charts use `libs/shared/src/components/chart` (`app-chart`, line and bar only) over Optimus `p-chart` and `chart.js` 4.6.1.
  Series colors are fixed slots validated for color vision deficiency: light `primary-500, amber-500, violet-500, rose-500, teal-500`, dark `primary-500, amber-600, violet-500, rose-500, teal-600` (the dark set is chosen when `<html>` has `app-dark`).
  A series past the fifth slot gets the muted text color instead of a cycled hue.
  The palette is read again when the theme or primary color changes; the tooltip shows the full date from the `titles` input.

## Tests

- Model rules: `analytics-period`, `retention`, `usage`, `analytics-format`, `analytics-labels`, `engagement`.
- Mappers and request helpers: every file in `services/` except the service, with reports built by `services/ga4-fixtures.ts`.
- Store: block loading, partial failure, empty period, app switch, stale answers, realtime refresh failure.
- Components: `kpi-card`, `usage-list`, `audience-summary`, `key-events`; shared `chart-config`.
