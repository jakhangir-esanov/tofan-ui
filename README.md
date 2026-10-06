# Tofan UI — admin panel

Angular 22 · Node.js 24 · Optimus UI 2 · Sakai layout · Tailwind CSS v4 · Vitest

## Tez start

```bash
npm install
npm start          # http://localhost:4200
```

Mock rejim yo'q: dev server `/api` so'rovlarini backend'ga uzatadi (`proxy.conf.json`,
standart `http://localhost:5179`). Kirish uchun backend'da `admin` realm roli bor Keycloak akkaunti kerak.

Rivojlanish rejasi va modullar: [docs/roadmap.md](docs/roadmap.md).

| Buyruq                  | Vazifasi                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm start`             | Dev server                                                               |
| `npm run start:staging` | Dev server, `/api` stend backend'iga uzatiladi                           |
| `npm run build`         | Production build (`dist/tofan-ui/browser`)                               |
| `npm test`              | Unit testlar (Vitest)                                                    |
| `npm run lint`          | ESLint + izohsizlik tekshiruvi + Sheriff (papkalar orasidagi bog'liqlik) |
| `npm run format`        | Prettier                                                                 |

## Arxitektura

Standart Angular feature tuzilmasi. Clean Architecture qatlamlari, repository abstraksiyalari,
use case klasslari va mock servislar yo'q — bu UI loyiha.

```
src/app/
├── core/                    # Butun ilova uchun bitta marta
│   ├── auth/                # AuthStore, AuthService, sessiya, guard'lar, token interceptor'lari
│   ├── http/                # ApiClient (HttpClient), API_BASE_URL, Result konverti, xatolik mapper'i
│   ├── layout/              # Sakai: topbar, sidebar, menyu, tema
│   ├── config/              # AppPaths, title strategy, Optimus UI provayderlari
│   └── feedback/            # Toast, tasdiqlash oynasi, clipboard, xato matnlari
├── features/                # Har bir bo'lim alohida, lazy yuklanadi
│   ├── dashboard/
│   ├── auth/                # login, "ruxsat yo'q", xatolik sahifalari
│   ├── exercises/
│   │   ├── pages/exercises-page/
│   │   ├── components/exercise-form-dialog/
│   │   ├── models/          # Exercise, filtr, draft (validatsiya), label'lar
│   │   ├── services/        # exercises.service.ts, exercise.dto.ts, exercise.mapper.ts
│   │   ├── exercises.store.ts
│   │   └── exercises.routes.ts
│   ├── foods/  media/  user-sessions/  notifications/  not-found/
├── shared/                  # Biznesdan xoli, istalgan feature'da ishlatiladi
│   ├── components/          # data-table, form-dialog, file-upload, localized-text-field, ...
│   ├── models/              # Page, SelectOption, FileCategory, xato klasslari
│   └── utils/               # enumMap, fayl hajmi, UUID, yuklash qoidalari
├── routes/
│   └── app.routes.ts
├── app.config.ts
└── app.ts
```

`directives/`, `pipes/`, `validators/` papkalari `shared/` ichida birinchi kerak bo'lganda yaratiladi.

### Bog'liqlik qoidasi

```
page ──> store ──> service ──> core/http/ApiClient ──> backend
core, shared ──X──> features
features/a   ──X──> features/b
```

Buni [Sheriff](https://github.com/softarc-consulting/sheriff) **majburiy** qiladi: qoidalar
`sheriff.config.ts` da, tekshiruv `npm run lint:boundaries` (`npm run lint` ichida). Sheriff importni
haqiqiy fayl yo'li bo'yicha tekshiradi, shuning uchun `../../foods/...` kabi nisbiy importlar ham ushlanadi.
Sheriff `src/main.ts` dan boshlab yuradi va test fayllarini ko'rmaydi; ularda `@features/*` importini
`eslint.config.js` dagi `no-restricted-imports` ushlaydi. Feature ichida nisbiy importlar ishlatiladi.

### Kelishuvlar

- Fayl nomlari Angular 22 uslubida: `exercises-page.ts`, `exercise-form-dialog.ts`, `app.ts`;
  `.store.ts`, `.service.ts`, `.dto.ts`, `.mapper.ts`, `.routes.ts`.
- Komponentlar standalone, zoneless, OnPush (Angular 22 da default), holat — `signal`/`computed`.
- Servislar `@Injectable({ providedIn: 'root' })`; store'lar `@Injectable()` va sahifaning
  `providers` ida.
- `inject()` ishlatiladi; `public` modifikatori yozilmaydi; template'ga kerakli a'zolar `protected`.
- Import alias'lar: `@core/*`, `@shared/*`, `@features/*`, `@environments/*`.
- Stillar: faqat CSS (`src/styles/`), Tailwind utility klasslari + `@openng/optimus-ui-tailwindcss`.
- UI matnlari o'zbek tilida.

## Yangi feature qo'shish (masalan, "Foydalanuvchilar")

> Tayyor namuna — `features/exercises`.

1. **Models**: `features/users/models/user.ts` (va kerak bo'lsa filtr, draft).
2. **Services**: `features/users/services/user.dto.ts` (backend javobi va so'rovi, qo'lda, stend
   Swagger'iga qarab), `user.mapper.ts` (+ spec), `users.service.ts` (`ApiClient` orqali).
3. **Store**: `features/users/users.store.ts` — servisni to'g'ridan-to'g'ri chaqiradi (+ spec).
4. **Sahifa**: `features/users/pages/users-page/users-page.ts`, `providers: [UsersStore]`.
5. **Route**: `features/users/users.routes.ts`, uni `routes/app.routes.ts` ga `loadChildren` bilan
   ulang; yo'lni `core/config/app-paths.ts` ga, menyu bandini `core/layout/menu/app-menu.ts` ga qo'shing.

## Backend bilan aloqa

Kod generatsiyasi ishlatilmaydi: admin panel bir necha endpoint bilan ishlaydi, shuning uchun
DTO'lar qo'lda yoziladi (`features/<x>/services/*.dto.ts`) va `ApiClient`
(`get` / `post` / `put` / `delete`) orqali chaqiriladi. Kontrakt manbai — stend Swagger'i:
`https://api.157.90.117.20.sslip.io/swagger/v1/swagger.json` (batafsil: `docs/backend-contract.md`).
Backend enum'lari son ko'rinishida keladi va DTO fayldagi `enum` + `enumMap`
(`shared/utils/enum-map.ts`) orqali model qiymatiga nom bo'yicha o'tkaziladi.

### Javob konverti va xatoliklar

Backend har bir yozuv amalini `Result` / `Result<T>` ichiga o'raydi, xatolikni esa RFC 7807
`problem+json` ko'rinishida qaytaradi (`title` — xato kodi, `detail` — matn).

- `ApiClient` (`core/http/api-client.ts`) konvertni ochadi va chaqiruvchiga faqat `data`
  ni beradi; `PagedList` kabi javoblar o'zgarishsiz o'tadi.
- Har qanday xatolik `shared/models/errors` dagi klassga aylanadi: `ValidationError`, `NotFoundError`,
  `ConflictError`, `BusinessRuleError` (kod bilan), `AccessDeniedError`, `SessionExpiredError`,
  `ServiceUnavailableError`. Presentation shu turlarga qarab xabar ko'rsatadi.

### Sessiya

- `POST auth/login` → Keycloak tokenlari; foydalanuvchi ma'lumoti access token claim'laridan
  o'qiladi (`sub`, `preferred_username`, `name`, `realm_access.roles`) — `/auth/me` endpoint'i yo'q.
- Panelga faqat `admin` realm roli bo'lganlar kiradi: rol bo'lmasa sessiya bekor qilinadi
  (`auth/logout`), guard esa `/auth/access-denied` ga yo'naltiradi.
- `authTokenInterceptor` Bearer tokenni faqat `apiBaseUrl` ga ketayotgan so'rovlarga qo'yadi.
  401 javobida `sessionInterceptor` bir marta `auth/refresh` qiladi va so'rovni qaytadan yuboradi;
  yangilash ham muvaffaqiyatsiz bo'lsa — login sahifasi. Parallel so'rovlar bitta yangilashni
  bo'lishadi (`AuthStore.renewSession`).

## Umumiy UI bloklari

Har bir feature'da qayta ishlatiladigan qismlar `shared/` va `core/feedback/` da:

| Blok                                     | Nima qiladi                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shared/components/data-table`           | Server tomonda sahifalanadigan jadval: `(pageChange)` → `PageRequest`, qatorni chaqiruvchi chizadi; `[loading]`, `emptyMessage`, xato uchun `[error]` va `(retry)` |
| `shared/components/form-dialog`          | Forma uchun modal: sarlavha, Saqlash/Bekor qilish, `saving` holati                                                                                                 |
| `shared/components/localized-text-field` | `name` / `nameUz` / `nameRu` uchligi bitta maydon sifatida                                                                                                         |
| `shared/components/file-upload`          | Fayl tanlash + progress; natijasi — `fileId`                                                                                                                       |
| `core/feedback/notification.service`     | Toast: `success(...)`, `error(error)` (xato matni avtomatik tanlanadi)                                                                                             |
| `core/feedback/confirmation.service`     | `confirmDelete(nom)` → `Promise<boolean>`                                                                                                                          |
| `core/feedback/error-message`            | Har qanday xatoni o'zbekcha matnga aylantiradi (backend kodlari lug'ati bilan)                                                                                     |

Jadval bilan sahifa quyidagicha yoziladi:

```html
<app-data-table
  [columns]="columns"
  [items]="page().items"
  [totalCount]="page().totalCount"
  [loading]="loading()"
  [error]="loadError()"
  (pageChange)="load($event)"
  (retry)="load()"
>
  <ng-template #row let-exercise>
    <tr>
      <td>{{ exercise.name }}</td>
    </tr>
  </ng-template>
</app-data-table>
```

Sahifalash shartnomasi `shared/models/page.ts` da: `PageRequest` (`first`, `rows`, `sortField`, `sortDirection`) va
`Page<T>`; ularni backend query parametrlariga `core/http/paging.mapper.ts` o'tkazadi.

### Fayl yuklash

`POST /files` multipart; progress uchun `ApiClient` emas, to'g'ridan-to'g'ri `HttpClient`
ishlatiladi. Hajm va kengaytma cheklovlari backend qoidalari bilan bir xil
(`shared/utils/file-upload-rules.ts`): mashq videosi 200 MB (`.mp4 .m4v .mov .webm`), hujjat
20 MB (`.pdf`), rasm 10 MB (`.jpg .jpeg .png .webp`). `files/{id}/content` anonim, shuning uchun
`img` / `video` teglarida to'g'ridan-to'g'ri ishlaydi.

## Muhitlar

| Fayl                          | `apiBaseUrl` |
| ----------------------------- | ------------ |
| `environment.development.ts`  | `/api`       |
| `environment.ts` (production) | `/api`       |

Dev serverda `/api` `proxy.conf.json` orqali backend'ga uzatiladi (`http://localhost:5179`,
prefiks olib tashlanadi). Shu sabab brauzerda CORS muammosi yo'q. Stendga ulanish uchun
`npm run start:staging` ishlating (`proxy.staging.conf.json`, `https://api.157.90.117.20.sslip.io`).

## Deploy

`Dockerfile` panelni yig'adi va `nginx` da beradi; `/api` shu nginx orqali `tofan-api:8080` ga
uzatiladi, shuning uchun production'da ham CORS kerak emas. Server qadamlari (Swarm stack, tashqi
nginx, sertifikat): [docs/deployment.md](docs/deployment.md).

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
yozilgan, tema logikasi (`ThemeService`) UI'dan ajratilgan, logo `shared/components/logo` da, layout `core/layout` da
(Tofan logosi bilan almashtiring).
