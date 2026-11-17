Status: needs-triage

# Admin dashboard: Firebase (GA4) analitikasi

Manba: Firebase loyihasi `tofan-68065`, Gemini in Firebase javoblari, Google Analytics Data API hujjati va grilling (2026-11-03).

## Problem Statement

Admin panelning `dashboard` sahifasida faqat salomlashish matni bor.
Admin mobil ilovalardan qancha odam foydalanayotganini, ular nima qilayotganini va qaysi versiya yoki platformada ekanini ko'ra olmaydi.
Bu ma'lumot Firebase Analytics'da (GA4 property `553445328`) bor, lekin uni faqat Firebase console orqali ko'rish mumkin.

## Solution

- Backend GA4 Data API'dan hisobotlarni o'qiydi va admin uchun tayyor endpoint'lar beradi.
- Admin panel `dashboard` sahifasida shu endpoint'lardan KPI kartochkalari va grafiklarni chizadi.
- Panel Google bilan to'g'ridan-to'g'ri gaplashmaydi: service account kaliti faqat backend'da (CLAUDE.md, 8-bo'lim).

## Faktlar

| Mavzu | Holat |
|---|---|
| Firebase tarifi | Spark (bepul) |
| GA4 property | `553445328`, bitta property'da hamma ilova |
| Soldier ilova | Android `com.peaktofan.tofan_tracker`, iOS `com.tofan.tofanmobile` |
| Trener ilova | Android va iOS `com.tofan.tofancoach` (`tofan_trainer` repo), trener web paneli |
| Eventlar (trener ilova kodida) | `screen_view`, `login`, `sign_up`, `workout_finished`, `food_logged`, user property `environment` |
| Data API kvotasi | property uchun kuniga 200 000, soatiga 40 000 token; bitta loyiha soatiga 14 000; bir vaqtda 10 so'rov |
| Ma'lumot kechikishi | standart hisobotlar 24-48 soat, realtime oxirgi 30 daqiqa |
| Crashlytics | o'qish uchun REST API yo'q, faqat BigQuery eksporti (Blaze kerak) |
| BigQuery | Spark'da faqat sandbox: jadvallar 60 kunda o'chadi, kunlik 1 mln event |
| Admin analitika endpoint'i | Swagger'da yo'q (2026-11-03) |

## Qarorlar (taklif, tasdiqlanmagan)

| # | Mavzu | Qaror |
|---|---|---|
| 1 | Manba | v1 faqat GA4 Data API; BigQuery va Crashlytics admin'ga kirmaydi |
| 2 | Tarif | Spark'da qolamiz |
| 3 | Ilovalar | asosiy ko'rinish soldier ilova, trener ilova alohida tanlov; ajratish GA4 stream bo'yicha |
| 4 | Muhit | hamma hisobot `environment = prod` bilan filtrlanadi |
| 5 | Grafik | Optimus `p-chart`; `chart.js` dependency foydalanuvchi ruxsatini kutadi |
| 6 | Biznes raqamlari | to'lovlar, trenerlar, obunalar soni Firebase'dan emas, backend DB'dan (bu spec'ga kirmaydi) |
| 7 | Kesh | backend keshlaydi: overview 1 soat, retention 6 soat, realtime 60 soniya |

## Backend kontrakti (taklif)

Hamma endpoint `Policies.Admin` bilan himoyalangan va `Result<T>` qaytaradi.
`app` backend enum'i: `AnalyticsApp { Soldier = 1, Trainer = 2 }`.
Backend `app` ni o'z konfiguratsiyasidagi GA4 stream ID'lariga aylantiradi (`streamId` dimension filtri).
`platform` backend enum'i: `AnalyticsPlatform { Android = 1, Ios = 2, Web = 3 }`.

### `GET /admin/analytics/overview?app=1&from=2026-10-06&to=2026-11-02`

`from` va `to` ixtiyoriy; default oxirgi 28 kun, kechagi kun bilan tugaydi.
Oraliq 1 kundan 365 kungacha.

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "activeUsers": { "daily": 120, "weekly": 540, "monthly": 1800 },
  "newUsers": 310,
  "signUps": 150,
  "logins": 900,
  "series": [
    { "date": "2026-11-02", "activeUsers": 120, "newUsers": 9, "workoutsFinished": 40, "foodsLogged": 210 }
  ],
  "platforms": [{ "platform": 1, "activeUsers": 1200 }],
  "appVersions": [{ "version": "1.4.0", "activeUsers": 900 }],
  "topScreens": [{ "screen": "HomeRoute", "views": 5400, "users": 1100 }],
  "workouts": {
    "count": 1200,
    "averageDurationMinutes": 52.5,
    "bySource": [{ "source": "session", "count": 800 }]
  },
  "foods": {
    "count": 6000,
    "bySource": [{ "source": "photo_scan", "count": 700 }],
    "byMealType": [{ "mealType": "breakfast", "count": 1500 }]
  }
}
```

- `activeUsers` oraliqning oxirgi kuni bo'yicha: `active1DayUsers`, `active7DayUsers`, `active28DayUsers`.
- `appVersions` va `topScreens` eng ko'pi bilan 10 ta qator.
- `workouts` va `foods` kerakli custom dimension yoki metric GA4'da ro'yxatdan o'tmagan bo'lsa `null` keladi, xato emas.

### `GET /admin/analytics/retention?app=1&weeks=8`

`weeks` 4 dan 12 gacha, default 8.

```json
{
  "generatedAt": "2026-11-03T08:00:00Z",
  "cohorts": [
    { "weekStart": "2026-09-07", "users": 120, "retained": [120, 64, 51, 40] }
  ]
}
```

`retained[0]` cohort hajmiga teng; `retained[n]` n-haftada qaytganlar soni.

### `GET /admin/analytics/realtime?app=1`

```json
{
  "generatedAt": "2026-11-03T08:00:00Z",
  "activeUsers": 14,
  "platforms": [{ "platform": 1, "activeUsers": 10 }]
}
```

### Xatolar

- GA4 javob bermasa yoki kvota tugasa: `503`, code `Analytics.Unavailable` (panelda `ServiceUnavailableError`).
- Noto'g'ri `from`/`to`/`weeks`: `400` ValidationError.

### Backend konfiguratsiyasi

- `Analytics:PropertyId = 553445328`.
- `Analytics:Streams:Soldier` va `Analytics:Streams:Trainer`: GA4 stream ID ro'yxatlari.
- Service account kaliti secret orqali beriladi, repo'da va panelda hech qachon turmaydi.
- Service account GA4 property'da Viewer roliga ega.
- Kutubxona: `Google.Analytics.Data.V1Beta`.

## Panel tomoni

- `features/dashboard` to'ldiriladi: `services/analytics.service.ts`, `analytics.dto.ts`, `analytics.mapper.ts`, `dashboard.store.ts`.
- Sahifa: ilova tanlovi (soldier yoki trener), sana oralig'i, KPI kartochkalari, trend grafigi, platforma va versiya taqsimoti, top ekranlar, workout va food bloklari, retention jadvali, realtime raqami.
- `null` blok ko'rinmaydi; 503 bo'lsa sahifa xabari va qayta urinish tugmasi.
- Hamma matn `core/i18n` kalitlari, uz/ru/en.

## Fog

- Soldier ilova kodi lokalda yo'q: u `workout_finished` va `food_logged` ni yuboradimi, tekshirilmagan.
- GA4'da custom dimension va metric'lar ro'yxatdan o'tganmi, noma'lum.
- Data retention 2 oymi yoki 14 oymi, noma'lum.
- Firebase Auth'da Apple va Google sign-in yoqilgan, kim ishlatishi noma'lum.

## Out of Scope

- Crashlytics crash-free %, BigQuery, FCM yetkazilish statistikasi.
- Biznes ko'rsatkichlari (to'lov, obuna, trener soni).
- Trener panelidagi dashboard.
