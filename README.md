# Tofan UI — admin panel

Angular 22 · Node.js 24 · Optimus UI 2 · Sakai layout · Tailwind CSS v4 · OpenAPI (ng-openapi-gen) · Vitest

## Tez start

```bash
npm install
npm start          # http://localhost:4200
```

Dev server `/api/*` so'rovlarini backend'ga proxy qiladi ([proxy.conf.mjs](proxy.conf.mjs)), shuning
uchun CORS kerak emas. Standart manzil — production API. Lokal backend bilan ishlash:
`TOFAN_API_URL=http://localhost:5179 npm start`.

Panelga faqat Keycloak'da `admin` realm roli bor hisob kiradi. Rol berilgandan keyin qayta login
qilish kerak — eski token ichida rol bo'lmaydi.

Rivojlanish rejasi va modullar: [docs/roadmap.md](docs/roadmap.md).

| Buyruq                 | Vazifasi                                         |
| ---------------------- | ------------------------------------------------ |
| `npm start`            | Dev server                                       |
| `npm run build`        | Production build (`dist/tofan-ui/browser`)       |
| `npm test`             | Unit testlar (Vitest)                            |
| `npm run lint`         | ESLint + arxitektura qatlamlari qoidalari        |
| `npm run format`       | Prettier                                         |
| `npm run api:fetch`    | Backend Swagger'ini yuklab, `openapi/` ga yozish |
| `npm run api:generate` | OpenAPI spec'dan HTTP client generatsiya qilish  |

## Arxitektura (Clean Architecture)

```
src/app/
├── domain/           # Biznes qoidalari. Toza TypeScript: Angular, RxJS, Optimus UI YO'Q
│   ├── auth/
│   │   ├── entities/        # AuthSession, UserProfile (admin roli)
│   │   ├── value-objects/   # Credentials (validatsiya bilan)
│   │   ├── errors/          # InvalidCredentialsError, SessionExpiredError
│   │   └── repositories/    # Portlar: AuthRepository, SessionRepository (abstract class)
│   └── shared/errors/       # ValidationError, NotFoundError, ConflictError, AccessDeniedError
├── application/      # Use case'lar. Faqat domain'ga bog'liq, Angular YO'Q
│   └── auth/                # LoginUseCase, LogoutUseCase, RefreshSessionUseCase ...
├── infrastructure/   # Adapterlar: portlarning konkret implementatsiyasi
│   ├── api/                 # ApiClient (Result konverti, xatolar → domain), ApiProblem
│   │   └── generated/       # ng-openapi-gen natijasi — QO'LDA O'ZGARTIRILMAYDI
│   ├── auth/                # HttpAuthRepository, JWT claim'lari, localStorage
│   └── http/                # authTokenInterceptor (token, refresh, retry)
├── presentation/     # UI: sahifalar, Sakai layout, store'lar, guard'lar
│   ├── auth/                # AuthStore (signal), unauthorizedInterceptor
│   ├── layout/              # Sakai: topbar, sidebar, menyu, tema konfiguratori
│   ├── pages/               # Route'lanadigan sahifalar
│   ├── routing/             # AppPaths, guard'lar, title strategy
│   └── shared/components/   # Qayta ishlatiladigan komponentlar
├── di/               # Composition root: portlarni adapterlarga bog'lash
├── app.config.ts
└── app.routes.ts
```

### Bog'liqlik qoidasi

```
presentation ───> application ──> domain
infrastructure ─┘ ──────────────> domain
di/, app.config.ts ──> hammasi (composition root)
```

Bu qoida `eslint.config.js` dagi `no-restricted-imports` orqali **majburiy**: masalan, `domain`
ichida `@angular/core` yoki `presentation` ichida `@infrastructure/*` import qilinsa `npm run lint`
xato beradi.

### SOLID qanday qo'llangan

- **S** — har bir klass bitta vazifa: `LoginUseCase` faqat login oqimi, `auth.mapper` faqat
  DTO → entity, `ThemeService` faqat Optimus UI tokenlarini qo'llaydi, `LayoutService` faqat layout holati.
- **O** — yangi backend/manba qo'shish uchun mavjud kod o'zgarmaydi: yangi adapter yoziladi va
  `di/` da bog'lanadi.
- **L** — portni implementatsiya qilgan har qanday adapter (`HttpAuthRepository` yoki testdagi
  soxta obyekt) use case uchun bir xil ishlaydi.
- **I** — portlar kichik: `AuthRepository` (identity) va `SessionRepository` (saqlash) alohida.
- **D** — use case'lar abstraksiyaga (`AuthRepository`) bog'liq; konkret klasslar faqat `di/` da
  tanlanadi. Use case'lar constructor injection bilan yoziladi va `useFactory` orqali ro'yxatdan o'tadi,
  shuning uchun ular Angular'siz test qilinadi.

### Kelishuvlar

- Fayl nomlari Angular style guide bo'yicha: `login-page.ts`, `auth.store.ts`, `login.use-case.ts`.
- Komponentlar standalone, zoneless, OnPush (Angular 22 da default), holat — `signal`/`computed`.
- `inject()` ishlatiladi; `public` modifikatori yozilmaydi; template'ga kerakli a'zolar `protected`.
- Import alias'lar: `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@environments/*`.
- Stillar: faqat CSS (`src/styles/`), Tailwind utility klasslari + `@openng/optimus-ui-tailwindcss`.
- UI matnlari o'zbek tilida.

## Yangi feature qo'shish (masalan, "Foydalanuvchilar")

1. **OpenAPI**: `npm run api:fetch && npm run api:generate`.
2. **Domain**: `domain/users/entities/user.ts`, `domain/users/repositories/user.repository.ts`
   (abstract class).
3. **Application**: `application/users/get-users.use-case.ts` — constructor'da `UserRepository`.
4. **Infrastructure**: `infrastructure/users/http-user.repository.ts` (`ApiClient.send` orqali) +
   `user.mapper.ts`.
5. **DI**: `di/users.providers.ts` → `provideUsers()` va uni `app.config.ts` ga qo'shing.
6. **Presentation**: `presentation/users/users.store.ts`, `presentation/pages/users/users-page.ts`,
   route'ni `app.routes.ts` ga, menyu bandini `presentation/layout/menu/app-menu.ts` ga qo'shing.
7. Use case va mapper uchun unit test yozing.

## OpenAPI

- Konfiguratsiya: `ng-openapi-gen.json`. Natija: `src/app/infrastructure/api/generated/`
  (git'ga commit qilinadi, Prettier/ESLint uni e'tiborsiz qoldiradi).
- `openapi/tofan-api.json` — backend Swagger'idan `npm run api:fetch` bilan olinadi
  ([scripts/openapi-normalize.mjs](scripts/openapi-normalize.mjs)). Manba: `TOFAN_OPENAPI_URL` yoki
  argument (URL yoki fayl), standart — production Swagger. Skript .NET generic nomlarini
  qisqartiradi (`Result<AuthTokenResponse>` → `AuthTokenResponseResult`), `operationId` qo'shadi
  (`POST /auth/login` → `postAuthLogin`) va nullable bo'lmagan maydonlarni `required` qiladi.
- Backend muvaffaqiyatli javobni `{ isSuccess, error, data }` ga o'raydi, xatoni esa ProblemDetails
  ko'rinishida qaytaradi (`title` — xato kodi). `ApiClient.send` konvertni ochadi va xatoni domain
  xatosiga aylantiradi: 400 `General.Validation` → `ValidationError`, 403 → `AccessDeniedError`,
  404 → `NotFoundError`, 409 → `ConflictError`. Endpoint'ga xos kodlar `translate` orqali beriladi.
- `authTokenInterceptor` Bearer tokenni faqat `apiBaseUrl` ga ketayotgan so'rovlarga qo'shadi.
  Muddati o'tgan tokenni so'rovdan oldin yangilaydi; 401 kelsa bir marta refresh qilib so'rovni
  qayta yuboradi. Yangilab bo'lmasa foydalanuvchi login sahifasiga qaytariladi.
- `/auth/me` yo'q: foydalanuvchi ismi va rollari access token claim'laridan o'qiladi.

## Muhitlar

Ikkala muhitda ham `apiBaseUrl: '/api'`. Dev'da uni `proxy.conf.mjs`, production'da nginx backend'ga
uzatadi.

## UI kutubxonasi: Optimus UI

UI komponentlari — [Optimus UI](https://optimus.openng.org) (`@openng/optimus-ui`). Bu PrimeNG 21
ning oxirgi MIT kodidan hamjamiyat qilgan fork: API PrimeNG bilan bir xil, faqat importlar
`primeng/*` o'rniga `@openng/optimus-ui/*`. Shuning uchun PrimeNG v21 hujjatlari ham asosan mos keladi.

| Paket                            | Vazifasi                        | Litsenziya |
| -------------------------------- | ------------------------------- | ---------- |
| `@openng/optimus-ui`             | Komponentlar                    | MIT        |
| `@openng/optimus-ui-themes`      | Aura / Lara / Nora presetlari   | MIT        |
| `@openng/optimus-ui-tailwindcss` | Tailwind plugin                 | MIT        |
| `@openng/icons`                  | Ikonkalar (`pi pi-*` klasslari) | MIT        |
| Sakai (sakai-ng)                 | Layout shabloni                 | MIT        |

⚠️ **`primeng`, `@primeuix/*` va `primeicons` paketlarini loyihaga qayta qo'shmang.** PrimeNG 22+,
`@primeuix/themes@3+` va `primeicons@8+` pullik PrimeUI License ostida chiqqan va litsenziya
kalitisiz "Invalid PrimeUI License" bannerini ko'rsatadi.

Uchinchi tomon kodidan olingan qismlarning litsenziya matnlari — [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Yangi kutubxona yoki boshqa loyihadan kod olsangiz, uning litsenziyasini tekshiring va kerak
bo'lsa shu faylga qo'shing.

## Sakai haqida

Layout [sakai-ng](https://github.com/primefaces/sakai-ng) asosida. O'zgarishlar: SCSS → toza CSS,
demo sahifalar olib tashlangan, komponentlar signal/`inject()`/yangi control flow bilan qayta
yozilgan, tema logikasi (`ThemeService`) UI'dan ajratilgan, logo `shared/components/logo` da
(Tofan logosi bilan almashtiring).
