# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Tofan Admin Panel (Angular). Strict, repository-aware rules for Claude Code. If a request conflicts with this file, follow this file.
If a request is ambiguous, choose the option that keeps the structure below simple and consistent.
Detailed rules live in `.claude/rules/` (loaded per file type) and `docs/` (read on demand).

## 1. Project identity

Tofan is a fitness ecosystem. This repository contains separate admin and coach panels and the public landing site (`peaktofan.com`) in one Nx workspace.
Backend (.NET 10, modular monolith, CQRS) lives in a separate repository.
Backend contract details: `docs/backend-contract.md`. Architecture rationale: `docs/architecture.md`.

Stack:
- Angular 22, TypeScript 6 (strict), standalone APIs only
- **UI library: Optimus UI 2** (`@openng/optimus-ui`, `@openng/optimus-ui-themes`, `@openng/icons`),
  theme via `provideOptimus` design tokens. It is the MIT fork of PrimeNG 21 with the same API.
  This is a settled decision: do not migrate to PrimeNG and never add `primeng`, `@primeuix/*` or
  `primeicons` (PrimeNG 22+ needs a paid PrimeUI license key, see `docs/architecture.md`)
- Signals first; RxJS only where streams are genuinely needed
- Keycloak tokens obtained through the backend (`POST /auth/login`, `/auth/refresh`, `/auth/logout`),
  kept in `libs/core/src/auth`; admin requires `admin`, coach requires `trainer` and a trainer card
- Nx task runner, Angular CLI builders, Vitest, ESLint, Sheriff, Prettier

## 2. Commands

```bash
npm start             # admin via Nx; local backend proxy
npm run start:staging # admin via Nx; staging backend proxy
npm run start:coach   # coach via Nx; local backend proxy
npm run start:coach:staging # coach via Nx; staging backend proxy
npm run start:prod    # admin via Nx; api.peaktofan.com proxy (API v9.1)
npm run start:coach:prod # coach via Nx; api.peaktofan.com proxy (API v9.1)
npm run start:landing # landing via Nx (SSR dev server, port 4400)
npm run build         # admin production build
npm run build:coach   # coach production build
npm run build:landing # landing production build (SSR, prerenders /, /ru, /en)
npm run serve:ssr:landing # serve dist/landing on :4000
npm test              # admin Vitest suite
npm run test:coach    # coach Vitest suite
npm run test:landing  # landing Vitest suite
npm run format        # Prettier over apps/ and libs/
npm run lint          # Nx lint targets + lint:comments + lint:boundaries
npm run lint:comments # fails on any comment in any project file
npm run lint:boundaries # sheriff verify: fails on an import that breaks the table in 3.1
npx ng g component apps/admin/src/app/features/<feature>/components/<name>
```

After every task: run `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` and `build:landing`. Fix what you broke. Never disable a rule to make it pass.
There is no mock backend: the dev server needs a running backend. `proxy.conf.json` forwards `/api` to
`http://localhost:5179` (prefix stripped); `npm run start:staging` uses `proxy.staging.conf.json`, which
forwards to the stage API `https://api.stage.peaktofan.com` (with `ws: true` for SignalR; the old
`*.157.90.117.20.sslip.io` addresses are closed). New backend work is tested on stage first and reaches
production only together on the release day, so do not deploy unreleased screens to the production panels.
`npm run start:prod` uses `proxy.prod.conf.json`, which forwards to
`https://api.peaktofan.com` (API v9.1, with `ws: true` for SignalR). Until the release day it is a copy of
production data that is re-copied on release day; after the release it is production, so never create test
data there. Signing in needs a Keycloak account with the realm role `admin`. Contract source: the Swagger of
`api.peaktofan.com` (`https://api.peaktofan.com/swagger/v1/swagger.json`); for work not released yet, the
stage Swagger (`https://api.stage.peaktofan.com/swagger/v1/swagger.json`).

Admin features live in `apps/admin/src/app/features`; Coach features live in `apps/coach/src/app/features`
(same `pages/`, `components/`, `models/`, `services/` layout; coach-only shared code in `apps/coach/src/app/core`).
The landing lives in `apps/landing`: SSR with prerendered `/`, `/ru`, `/en`, no backend calls, no Optimus UI, and its own
typed dictionary in `apps/landing/src/app/core/i18n` (the panel dictionary is too heavy for a public page). Details and
traps: `docs/modules/landing.md`.
Shared auth, HTTP, feedback and i18n live in `libs/core`; shared UI, models and utilities live in
`libs/shared`. Import aliases: `@core/*`, `@shared/*`, `@features/*`, `@coach/*`, `@environments/*`,
`@coach-environments/*`, `@landing/*`. Admin styles live in `apps/admin/src/styles/`; Coach styles live in
`apps/coach/src/`. Both use Tailwind v4 utilities + `@openng/optimus-ui-tailwindcss`; admin layout is
a side menu plus one sheet modelled on ZM Maktab `feat/ui-design-foundation` (`docs/onboarding.md` section 9). `AGENTS.md` is the tool-neutral copy of these rules; keep it in sync.

### 2.1 Production

The `Dockerfile` builds the panel on `node:24-slim` and serves `dist/tofan-ui/browser` from
`nginx:1.29-alpine` on port 8080. The image is environment-agnostic: both environments build with
`apiBaseUrl: '/api'`, and the image's own nginx (`nginx/default.conf.template`) proxies `/api/*` to
`API_UPSTREAM` with the prefix stripped, so the browser sees a single origin and no CORS is needed.

```bash
docker build -t ejakhangir/tofan-admin:<tag> .
docker run --rm -p 8080:8080 -e API_UPSTREAM=http://host.docker.internal:5179 ejakhangir/tofan-admin:<tag>
curl -s http://localhost:8080/healthz   # ok
```

| Env | Default | Purpose |
|---|---|---|
| `API_UPSTREAM` | `http://tofan-api:8080` | backend that `/api` is forwarded to |
| `NGINX_RESOLVER` | `127.0.0.11` | Docker DNS, re-resolves the upstream so a restarted API does not give 502 |

- Caching: `index.html` is `no-cache`, hashed `*.js`/`*.css` are immutable for a year; other routes fall
  back to `index.html` (SPA).
- `client_max_body_size 220m` matches the backend limit (200 MB video upload); change both together.
- Server: Docker Swarm stack `tofan-admin` on `tofan-net` behind an external TLS nginx; deploy by pushing
  a new tag, setting `TOFAN_ADMIN_IMAGE` and re-running `docker stack deploy` (`start-first`, no downtime).
  Full steps, certificate and external nginx config: `docs/deployment.md`.

### 2.2 Landing production

`Dockerfile.landing` builds `dist/landing` and runs the Angular SSR Express server (`node dist/landing/server/server.mjs`)
on port 4000; `GET /healthz` returns `ok`. SSR only answers the hosts in `security.allowedHosts` (`angular.json`).

## 3. Architecture (non-negotiable)

Standard Angular feature-based structure. **No Clean Architecture layers** (no domain/application/
infrastructure/presentation split, no repository abstractions, no use-case classes, no DI composition
folder). It is a UI project; keep it flat and readable.

```text
apps/admin/src/app/
  core/layout/             # admin shell, sidebar, topbar, menu and theme
  features/                # admin feature groups, lazy loaded
  routes/                  # admin app.routes.ts
apps/coach/src/app/
  core/                    # coach shell, ui primitives, formats, shared client, payment and video code, profile guard
  features/                # auth, dashboard, programs, clients, chat, profile, posts, video-collections (lazy loaded)
  routes/                  # coach app.routes.ts
apps/landing/src/app/
  core/                    # links, landing dictionary and locale routes, shell, SEO head
  shared/                  # icon sprite and icon component
  features/                # home, not-found (lazy loaded)
  routes/                  # landing app.routes.ts and app.routes.server.ts
libs/core/src/             # shared auth, HTTP, feedback and i18n
libs/shared/src/           # shared components, models and utilities
```

Current features: `dashboard`, `auth` (login, access denied, error pages), `exercises`, `foods`,
`media`, `soldiers`, `accounts`, `trainers`, `garments`, `tariffs`, `user-sessions`, `notifications`, `platform-fee`, `discounts`, `payment-orders`, `not-found`. Every feature, even a single-page one, keeps
its routed components in `pages/` and has its own `<feature>.routes.ts`; `routes/app.routes.ts` only
uses `loadChildren`.

### 3.1 Dependency direction

| Folder | May import | Must NOT import |
|---|---|---|
| apps/admin, apps/coach, apps/landing | own features, `libs/core`, `libs/shared` | each other |
| libs/core | other core areas, `libs/shared` | app features |
| libs/shared | shared code, core HTTP/feedback/i18n | app features, core layout |
| feature/<x> | core, shared, own files | other features |

- The table is enforced by Sheriff (`sheriff.config.ts`, run by `npm run lint:boundaries`). It follows the
  real file an import resolves to, so relative imports (`../../foods/...`) are caught too. Sheriff walks
  the admin app from `apps/admin/src/main.ts`, so spec files are not checked by it; ESLint `no-restricted-imports` still
  rejects `@features/*` imports in `core/`, `shared/` and `features/` (specs included) and shows it in the editor.
  Sheriff runs as a CLI only: `@softarc/eslint-plugin-sheriff` does not support ESLint 10 yet.
- Apps **never** import each other; features **never** import other features.
  Inside a feature use relative imports; across boundaries use `@core/*`, `@shared/*`, `@features/*` or `@coach/*`.
  Code used by both apps belongs in `libs/core` or `libs/shared`.
  A feature may call a backend endpoint that "belongs" to another screen through its own service and DTO
  (example: `media` reads `GET /exercises` to find videos in use).
- Only `app.config.ts` reads `environments/` (Sheriff: the root module is not importable from any tag).
- Each feature must stay removable: deleting `features/<x>` must break only its route entry and menu item.

### 3.2 Where things go

| Need | Location | File name |
|---|---|---|
| Model / entity | `features/<x>/models/` | `exercise.ts` |
| Filter, draft, labels, pure rule | `features/<x>/models/` | `exercise-filter.ts`, `exercise-draft.ts`, `garment-labels.ts` |
| Backend DTO | `features/<x>/services/` | `exercise.dto.ts` |
| DTO ↔ model mapping | `features/<x>/services/` | `exercise.mapper.ts` |
| HTTP calls | `features/<x>/services/` | `exercises.service.ts` |
| Screen state | `features/<x>/` | `exercises.store.ts` |
| Routed screen | `features/<x>/pages/<name>-page/` | `exercises-page.ts` |
| Feature-only component | `features/<x>/components/<name>/` | `exercise-form-dialog.ts` |
| Reusable component | `shared/components/<name>/` | `data-table.ts` |
| Route guard | `core/auth/` | `auth.guard.ts` |

Angular 22 file naming: no `.component` suffix (`exercise-form-dialog.ts`, class `ExerciseFormDialog`).
Stores `.store.ts`, services `.service.ts`, DTOs `.dto.ts`, mappers `.mapper.ts`, routes `.routes.ts`.

## 4. SOLID in this codebase

- **S** — one component = one screen part; one store = one screen; one service = one backend resource.
  Split at ~200 lines.
- **O** — extend via inputs, content projection, strategy maps; do not add `if (type === ...)` chains.
- **I** — small services per resource (`NotificationTemplatesService`, `PushNotificationsService`).
- **D** — components talk to stores, stores talk to services, services talk to `ApiClient`.
  Components never inject a service that does HTTP. The one exception is
  `shared/components/file-upload`, whose whole job is uploading through `FileUploadService`.

## 5. Angular 22 rules

- Standalone only. No NgModules. No `standalone: true` (it is the default).
- OnPush is the default in v22: do **not** write `changeDetection`. Never use `Eager`.
- `inject()` only. No constructor injection.
- Services: `@Injectable({ providedIn: 'root' })`. Stores: `@Injectable()`, provided by the page
  (`providers: [ExercisesStore]`).
- Signals: `input()`, `input.required()`, `output()`, `model()`, `computed()`, `linkedSignal()`.
  No `@Input`/`@Output` decorators. `effect()` only for side effects outside Angular (logging, storage).
- Templates: `@if`, `@for (...; track item.id)`, `@switch`, `@let`, `@defer`.
  No `*ngIf`, `*ngFor`, `ngClass`, `ngStyle` → use `[class.x]`, `[style.x]`.
- Forms: Signal Forms (`form()`, `[formField]`) for all new forms (reference: `features/garments`;
  Optimus `p-select`/`p-datepicker`/`p-inputnumber` go through the `shared/components` wrappers, see
  `.claude/rules/forms.md`). The older forms are still Reactive Forms (login, exercise/food filters,
  the three older form dialogs, send notification); migrate a form when it is reworked, not in passing.
- Routing: lazy `loadChildren` per feature, functional guards, `withComponentInputBinding()`.
- No `any`, in any form: annotations, `as any`, `any[]`, rest parameters, `$any()` in templates, or an
  `any` leaking from a library (`JSON.parse`, untyped APIs). Type it or use `unknown` and narrow.
  ESLint enforces it with type-aware rules (`no-explicit-any`, `no-unsafe-*`, `template/no-any`).
  No non-null `!` to silence the compiler. No `subscribe()` in components unless
  unavoidable; if so, `takeUntilDestroyed()`.

## 6. UI library rules (Optimus UI)

- Before component, form, overlay or theme work, read `.agents/skills/optimus-ui/SKILL.md`.
  Primary documentation: https://optimus.openng.org/llms/llms.txt. Find the relevant page in that index
  and read its `.md` representation; use the full documentation only when a focused page is insufficient.
  Verify every component API and token against the installed package and existing shared wrappers.
- Optimus UI components are used in components, pages, `shared/components/` and `core/layout/`.
  Never in models, services or stores.
- Repeated patterns (data table with server paging, form dialog, localized text field, file upload)
  live once in `shared/components/`. Features use them, not raw copies.
- Server-side tables: `app-data-table` (lazy `p-table`); `pageChange` → store → service.
  No client-side paging on admin lists.
- Styling: design tokens / theme preset only. No `::ng-deep`, no `!important`, no inline hex colors.
- Toasts and confirms go through `core/feedback` (`NotificationService`, `ConfirmDialogService`),
  not `MessageService` in every component.
- Import individual components (`import { TableModule } from '@openng/optimus-ui/table'`), never barrels.
- Prefer official Optimus documentation. PrimeNG v21 documentation is a fallback only after verifying
  the relevant Optimus API; do not assume newer PrimeNG documentation matches the installed package.

## 7. Backend integration

- Backend owns business rules. The admin panel validates for UX, never as the only guard.
- No OpenAPI client generation. DTOs are hand-written from the `api.peaktofan.com` Swagger and called through
  `core/http/ApiClient` (`get`, `post`, `put`, `delete`) in `features/<x>/services/`.
  The panel uses a handful of endpoints; a generator is not worth it.
- No use-case classes and no repository abstractions. A store calls the service directly and
  applies model rules (`createExerciseDraft`, ...) itself.
- `HttpClient` only in `core/http/`, `core/auth/` and `*.service.ts` files (upload progress in
  `shared/components/file-upload/file-upload.service.ts`).
- All URLs come from the `API_BASE_URL` token. No hard-coded hosts.
- DTOs mirror backend responses exactly; models are what the UI needs. Map in `*.mapper.ts`, never in templates.
- Backend enums are integers: a DTO `enum` plus `enumMap` from `shared/utils/enum-map.ts` maps them by name.
- Failures: `ApiClient` turns ProblemDetails and failed `Result` envelopes into error classes from
  `shared/models/errors` (`ValidationError`, `NotFoundError`, `ConflictError`, `BusinessRuleError`,
  `AccessDeniedError`, `ServiceUnavailableError`) and `core/auth/SessionExpiredError`, each carrying the
  backend `code`. Code switches on the class or `code`, never on message text.
  User-facing text comes from `core/feedback/error-message.ts`.
- Paging uses `PageRequest` / `Page<T>` from `shared/models/page.ts`; `core/http/paging.mapper.ts`
  builds the query (snake_case `SortField`).
- Dates travel as ISO strings and are mapped to `Date` in mappers. Time-dependent rules take `now` as a
  parameter so they stay testable.

## 8. Auth and permissions

**Identity boundary: Angular → .NET API → Keycloak.** Angular must not call the Keycloak Admin API
directly. Administrative identity operations go through the .NET backend; Keycloak is an
infrastructure concern behind backend abstractions.

- Today the panel signs in through the backend (`/auth/login`, `/auth/refresh`, `/auth/logout`), which
  returns Keycloak tokens. A move to the Keycloak login page (OIDC + PKCE via `keycloak-angular`) is
  planned (`docs/architecture.md`); it would live entirely in `core/auth`.
- Users, roles, permissions, activation/deactivation, creation, deletion, role assignment: call the
  backend (`/admin/users`, ...) through a feature service, never `/admin/realms/{realm}/...`.
  If the backend endpoint does not exist yet, stop and say so; do not work around it from Angular.
- Never put Keycloak Admin API credentials, service-account credentials, client secrets or privileged
  realm configuration in the panel (environment files, code, docs).
  The dashboard reads GA4 through the backend (`POST /admin/analytics/reports/{kind}`); the GA4 service
  account key stays on the server (`docs/modules/dashboard.md`).
- The backend is the security boundary: it validates tokens and authorizes every admin endpoint.
- Backend side (for reference when proposing endpoints): the Application layer depends on an identity
  abstraction (existing: `IIdentityProviderClient` in `Tofan.Modules.Auth.Application`), Keycloak code
  lives in Infrastructure (`KeycloakAdminClient`). Reuse it; do not propose a second abstraction.
- A direct Angular → Keycloak Admin API dependency needs a specific reason; explain the reason and the
  consequences to the user before implementing anything like it.
- Tokens and claims are read only in `core/auth` (`AuthStore`, `auth.mapper.ts`). Features use
  `AuthStore` (`currentUser()`, `displayName()`, `isAdmin()`).
- The bearer token is attached by `auth-token.interceptor.ts` only for `API_BASE_URL` requests;
  `session.interceptor.ts` refreshes once on 401.
- Access: `authGuard` lets in users with the realm role `admin` (the backend's only policy,
  `Policies.Admin`). Finer permissions get added to `core/auth` when the backend splits the policy.
- Hiding a button is UX, not security. The backend still enforces.

## 9. State

- Default: a signal store per screen in `features/<x>/<x>.store.ts` (`signal()` + `computed()` + methods).
- Components read `store.items()`, call `store.load()`. Components never mutate store internals.
- Stores are provided by the page (`providers: [ExercisesStore]`), not in root, unless truly global
  (`AuthStore`).
- No global state library unless the user explicitly asks.

## 10. Clean code

- No comments anywhere in the project: TS, JS, HTML, CSS, JSON/JSONC configs, `.gitignore`-style files.
  That includes JSDoc, `// @ts-check`, `// @ts-ignore`, `/* eslint-disable */`, `<!-- -->`.
  If code needs a comment, rename or extract instead (an intentionally ignored failure gets a named
  function such as `keepSigningOutWhenBackendIsUnreachable`, never an empty or commented `catch`).
  Enforced by the `tofan/no-comments` ESLint rule (TS, HTML, inline templates) and
  `scripts/check-no-comments.mjs` (every other file), both run by `npm run lint`. Markdown docs are exempt.
  Reasoning goes into commit messages and `docs/modules/<feature>.md`.
- Names reveal intent: `ExercisesStore`, `ExerciseFormDialog`, `toExercise`.
  Forbidden names: `Helper`, `Util`, `Manager`, `CommonService`, `DataService`, `data`, `item2`.
- Functions ≤ 25 lines, components ≤ 200 lines, templates ≤ 150 lines. Extract before exceeding.
- No magic strings/numbers: constants, enums or union types.
- No UI text in templates or `.ts` files: every label, message, toast, title and placeholder is a
  `core/i18n` key in `translations/uz`, `ru` and `en` (`{{ 'media.page.title' | t }}`,
  `notifications.success('media.page.deleted', { name })`). Keys are typed; a missing translation breaks
  the build. Rules and traps: `docs/modules/i18n.md`.
- No dead code, no commented-out code, no `console.log` left behind.
- `readonly` everywhere possible; `protected` for template-only members; `private` for the rest.
- Early returns over nested ifs. No clever one-liners.

## 11. Testing

- Every store, mapper, guard and pure model rule gets a unit test (Vitest).
- Components: test inputs → rendered output and outputs emitted.
- Store tests mock the feature service (`{ provide: ExercisesService, useValue: {...} }`),
  never `HttpClient`.
- Test file sits next to the file: `exercise.mapper.spec.ts`.
- Test names: `should <result> when <condition>`.

## 12. How to work on a request

Before writing code, decide:
1. Which feature owns this screen? New screen group → new `features/<x>`.
2. Read or write? Which backend endpoint and DTO?
3. Which folder owns each part (table in 3.2)?
4. Does `shared/` or `core/` already have it? Reuse before creating.
5. Does the backend protect it (admin policy)?
6. Which tests prove it?

Then:
- For a new feature → use skill `new-feature`.
- For a list + create/edit screen → use skill `crud-page`.
- After a large change → delegate to subagent `architecture-reviewer`.
- If a business rule is unclear, ask. If only the structure is unclear, follow this file and the
  most complete existing feature (reference feature: `features/exercises`).

## 13. Forbidden

- Clean Architecture layer folders (`domain/`, `application/`, `infrastructure/`, `presentation/`,
  `data-access/`), repository abstractions, use-case classes, DI composition folders
- OpenAPI code generators (`ng-openapi-gen`, `openapi-generator`, ...) and generated clients
- Mock backends or fake services; the panel talks to the real backend
- `HttpClient` outside `core/http/`, `core/auth/` and `*.service.ts`
- Business logic inside components or templates
- Importing one feature from another feature
- Calling the Keycloak Admin API (`/admin/realms/...`) or holding Keycloak secrets in the panel
- Migrating from Optimus UI to PrimeNG, or adding `primeng`, `@primeuix/*`, `primeicons`
- NgModules, constructor injection, `@Input`/`@Output`, `*ngIf`/`*ngFor`
- `any` of any kind (explicit, cast, leaked from a library, `$any()`), `as unknown as`, `@ts-ignore`, `eslint-disable`
- `::ng-deep`, `!important`, inline colors
- Reading tokens/claims outside `core/auth`
- Hard-coded API URLs, error messages matched by text
- New dependencies without asking the user first
- Comments of any kind in any project file (see 10); `npm run lint` fails on them
- "Quick" shortcuts that break any rule above. Speed is allowed; structural shortcuts are not.

## 14. Definition of done

- [ ] Right feature, right folder, right file name
- [ ] Dependency table (3.1) respected, no cross-feature imports
- [ ] Signals, OnPush default, `inject()`, new control flow
- [ ] Optimus UI only in components/pages/shared/layout, via shared components where they exist
- [ ] DTO → mapper → model, errors by class or `code`
- [ ] Tests added; `lint`, `test`, `build` pass
- [ ] `docs/modules/<feature>.md` updated if behaviour or structure changed

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Agent skills

### Optimus UI

For UI components, theme tokens, responsive layouts and Signal Forms adapters, use
[optimus-ui](.agents/skills/optimus-ui/SKILL.md). Official documentation index:
https://optimus.openng.org/llms/llms.txt.

### Issue tracker

Issue va spec'lar repo ichida `.scratch/<feature>/` papkasida markdown fayl bo'lib yuritiladi. See `docs/agents/issue-tracker.md`.

### Triage labels

Standart besh yorliq: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: ildizda `CONTEXT.md` va `docs/adr/`. See `docs/agents/domain.md`.
