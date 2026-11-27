# AGENTS.md — Tofan Admin and Coach Panels

Tool-neutral guide for AI coding agents (Codex, Cursor, Copilot, Gemini, etc.).
Claude Code reads `CLAUDE.md`; that file is the full source of truth. Keep both in sync.

## Project
Admin and coach panels and the public landing site (`peaktofan.com`) for the Tofan fitness ecosystem. Angular 22, TypeScript 6 strict, Optimus UI 2
(MIT fork of PrimeNG 21, same API; never add `primeng`), Signals. Sign-in goes through the backend,
which returns Keycloak tokens. Backend: separate .NET 10 modular monolith.

## Commands
- `npm start` — dev server; `/api` is proxied to the local backend (no mock backend)
- `npm run start:staging` - dev server; `/api` is proxied to the stage API `https://api.stage.peaktofan.com` (`proxy.staging.conf.json`, `ws: true`); new backend work is tested there and reaches production only on the release day
- `npm run start:prod` — dev server; `/api` is proxied to `https://api.peaktofan.com` (`proxy.prod.conf.json`, API v9.1, `ws: true`); it is production after the release, so never create test data there
- `npm run start:coach` / `npm run start:coach:staging` / `npm run start:coach:prod` — coach dev server
- Contract source: `https://api.peaktofan.com/swagger/v1/swagger.json`; for work not released yet, `https://api.stage.peaktofan.com/swagger/v1/swagger.json`
- `npm run build:coach` — coach production build
- `npm run start:landing` / `npm run build:landing` / `npm run test:landing` - landing (SSR) dev server, build and Vitest suite
- `npm run lint` — must pass (ESLint + `lint:comments`, which rejects any comment in any project file,
  + `lint:boundaries`, Sheriff checking the folder dependency rules in `sheriff.config.ts`)
- `npm test` — Vitest, must pass
- `npm run test:coach` — coach Vitest suite
- `npm run build` — must pass
- `npm run format` — Prettier over `apps/` and `libs/`
- After every task run `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` and `build:landing`; fix what you broke and never
  disable a rule to make it pass

## Architecture
Standard Angular feature-based structure. No Clean Architecture layers, no repository abstractions,
no use-case classes, no OpenAPI generation, no mock services.

```text
apps/admin/src/app/
  core/layout/   admin shell, menu, theme and app config
  features/<x>/  pages/, components/, models/, services/, <x>.store.ts, <x>.routes.ts
  routes/        admin app.routes.ts
apps/coach/src/app/
  core/          coach shell, profile guard and the shared coach profile service
  features/<x>/  auth, programs, content, profile, clients (same layout as admin features)
  routes/        coach app.routes.ts
apps/landing/src/app/
  core/          links, landing dictionary and locale routes, shell, SEO head
  shared/        icon sprite and icon component
  features/<x>/  home, trainer, not-found
  routes/        app.routes.ts and app.routes.server.ts
libs/core/src/   shared auth, http, feedback and i18n
libs/shared/src/ reusable components, models and utilities
```

Admin features: `dashboard`, `auth`, `exercises`, `foods`, `media`, `soldiers`, `accounts`, `trainers`,
`garments`, `tariffs`, `user-sessions`, `notifications`, `platform-fee`, `discounts`, `payment-orders`, `not-found`. Every feature keeps routed components in `pages/`
and has its own `<feature>.routes.ts`; `routes/app.routes.ts` only uses `loadChildren`. Reference feature:
`features/exercises`.

Import aliases: `@core/*`, `@shared/*`, `@features/*`, `@coach/*`, `@environments/*`, `@coach-environments/*`, `@landing/*`.
The landing (`apps/landing`) is SSR with prerendered `/`, `/ru`, `/en`, calls one public endpoint (the server-rendered trainer
page `/t/<slug>`), uses no Optimus UI and keeps its
own typed dictionary in `apps/landing/src/app/core/i18n`; see `docs/modules/landing.md`.
Use relative imports inside a feature and aliases across boundaries.

File placement and naming (no `.component` suffix): models and pure rules in `models/` (`exercise.ts`,
`exercise-filter.ts`), DTOs `*.dto.ts`, mappers `*.mapper.ts`, HTTP `*.service.ts` in `services/`, state
`<x>.store.ts`, routed screens `pages/<name>-page/<name>-page.ts`, feature-only components
`components/<name>/`, reusable components `libs/shared/src/components/<name>/`, route guards in `core/auth/`.

Dependency rules:
- `libs/core` and `libs/shared` never import app features
- features never import other features (relative imports inside a feature)
- components → store → service → `libs/core/http/ApiClient`; components never call a service that does HTTP
- each app may import shared libraries; apps must not import one another
- only each app's `app.config.ts` reads its environment configuration

## Identity boundary
Angular → .NET API → Keycloak. Angular must not call the Keycloak Admin API directly. Administrative
identity operations (users, roles, permissions, activation, deletion, role assignment) go through the
.NET backend; Keycloak is an infrastructure concern behind backend abstractions (`IIdentityProviderClient`).
Tokens and claims are read only in `libs/core/src/auth`. Admin requires the `admin` role; coach requires
the `trainer` role and an existing trainer card. Never expose Keycloak Admin API credentials,
service-account credentials or client secrets to Angular. The backend authorizes; hiding UI is only UX.
The admin dashboard reads GA4 through the backend (`POST /admin/analytics/reports/{kind}`); the GA4 service account
key stays on the server (`docs/modules/dashboard.md`).

## UI library
Optimus UI 2 (`@openng/optimus-ui`), MIT fork of PrimeNG 21 with the same API. Settled decision:
do not migrate to PrimeNG, never add `primeng`, `@primeuix/*`, `primeicons` (PrimeNG 22+ is paid).

Before UI component, form, overlay or theme work, read `.agents/skills/optimus-ui/SKILL.md`.
Primary documentation: https://optimus.openng.org/llms/llms.txt. Read focused component pages in
their `.md` form and verify APIs/tokens against the installed package and shared wrappers.
PrimeNG v21 documentation is a fallback only after verifying the relevant Optimus API.

## Coding rules
- Standalone, OnPush (default in v22), `inject()`
- Services `@Injectable({ providedIn: 'root' })`; stores `@Injectable()` provided by the page
- `input()` / `output()` / `model()`, `@if` / `@for` / `@switch`
- Signal Forms for new forms (existing forms are still Reactive Forms)
- Optimus UI only in components, pages, `libs/shared/components` and app layouts; server-side paging for tables
- Hand-written DTOs + mappers in `apps/<app>/src/app/features/<x>/services/`; errors handled by error class or backend `code`,
  never by message text
- No `any` at all (explicit, `as any`, leaked from libraries, `$any()` in templates; ESLint type-aware
  rules fail the lint), no `@ts-ignore`, no `::ng-deep`, no comments anywhere (TS, HTML, CSS, JSON,
  dotfiles; `npm run lint` rejects them)
- No UI text in templates or `.ts` files: every label, message, toast, title and placeholder is a typed
  `core/i18n` key with `uz`, `ru` and `en` translations (`{{ 'media.page.title' | t }}`); see `docs/modules/i18n.md`
- Backend enums are integers: DTO `enum` plus `enumMap` from `shared/utils/enum-map.ts`; dates travel as ISO
  strings and become `Date` in mappers; shared paging uses `PageRequest` / `Page<T>`
- Toasts and confirms go through `core/feedback` (`NotificationService`, `ConfirmDialogService`)
- No magic strings/numbers, no dead code, no `console.log`; `readonly` where possible, `protected` for
  template-only members, `private` for the rest; no forbidden names (`Helper`, `Util`, `Manager`, `data`)
- SOLID, small functions (≤ 25 lines), components ≤ 200 lines, templates ≤ 150 lines
- Never add dependencies without asking the user first
- Tests next to the file (`*.spec.ts`) for stores, mappers, guards, model rules; admin and coach have separate Nx test targets
- Store tests mock the feature service, never `HttpClient`; test names read `should <result> when <condition>`

## Definition of done
- Right feature, folder and file name; dependency rules respected, no cross-feature imports
- Signals, `inject()`, new control flow; Optimus UI only where allowed, via shared wrappers when they exist
- DTO → mapper → model, errors by class or `code`
- Tests added; `lint`, `test`, `build` pass
- `docs/modules/<feature>.md` updated when behaviour or structure changed

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
