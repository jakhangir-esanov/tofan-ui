# Admin dashboard uchun Firebase (GA4) analitikasi: backend'ga so'rov

Kimdan: Otabek (frontend)
Kimga: backend jamoasi
Sana: 2026-11-10

## 1. Qisqacha

Admin panelning dashboard sahifasida Firebase Analytics'dagi (GA4) ma'lumotlarni to'liq ko'rsatmoqchimiz.
Qamrov to'rt guruh:

| Guruh | Nima ko'rsatiladi |
|---|---|
| Auditoriya | aktiv va yangi foydalanuvchilar, sessiya, engagement, retention |
| Texnologiya va geografiya | platforma, ilova versiyasi, OS, qurilma, mamlakat, shahar, til |
| Xulq-atvor | ekranlar va custom eventlar (login, sign up, mashg'ulot, ovqat) |
| Realtime | oxirgi 30 daqiqadagi faollik |

Buning uchun backend'da GA4 Data API'dan o'qiydigan 7 ta read-only endpoint kerak.
Frontend'ning o'zida buni xavfsiz qilib bo'lmaydi, sabablari 2-bo'limda.
Bu hujjat o'zi yetarli: kontrakt taklifi 5-bo'limda to'liq berilgan.

## 2. Nega faqat frontend'da qilib bo'lmaydi

### 2.1 GA4 Data API oddiy API key bilan ishlamaydi

Data API faqat OAuth 2.0 token yoki service account bilan chaqiriladi.
Firebase web config'dagi `apiKey` sir emas va Data API'ga kirish bermaydi.
Demak "kalitni frontga qo'yib, to'g'ridan-to'g'ri chaqiramiz" degan variant faqat service account kaliti bilan bo'lishi mumkin.

### 2.2 Service account kalitini brauzerga berib bo'lmaydi

Angular ilovasi to'liq brauzerga yuklanadi.
Kalitni environment faylga yoki kodga qo'ysak, u JS bundle ichida har bir foydalanuvchiga boradi.
Panelni ochgan har kim DevTools orqali private key'ni ko'chirib oladi.
Login sahifasi ham shu bundle'ni yuklaydi, ya'ni kalitni olish uchun tizimga kirish ham shart emas.
Kalit oqib chiqsa, uni bekor qilmagunimizcha begona odam property'dagi hamma analitikani o'qiydi va kvotamizni sarflaydi.
Loyiha qoidasi ham shunday: tashqi xizmat kalitlari panelda turmaydi, yo'l doim Angular -> .NET API -> tashqi xizmat.

### 2.3 Brauzerda Google OAuth: ishlaydi, lekin bizga to'g'ri kelmaydi

Sirsiz variant bor: admin "Google bilan ulash" tugmasini bosadi va o'z Google akkaunti bilan `analytics.readonly` token oladi.
Kamchiliklari:

- Har bir admin'ning shaxsiy Google akkauntiga GA4 property'da Viewer roli berilishi kerak va bu qo'lda boshqariladi.
- Panelda ikkinchi login paydo bo'ladi: Keycloak va Google.
- Token 1 soat yashaydi, admin qayta-qayta ulanadi.
- Kesh yo'q: har sahifa ochilishi va har admin alohida kvota sarflaydi.
- Kirish nazorati backend'dagi `Policies.Admin` dan chiqib, Google akkaunt sozlamalariga o'tib ketadi.

### 2.4 Looker Studio embed: tez, lekin cheklangan

GA4 hisobotini `iframe` bilan qo'yish mumkin.
Ko'rinishi panel dizayniga mos kelmaydi, dark mode va uz/ru/en tarjima yo'q, ko'rish uchun yana Google akkaunt ruxsati kerak.

### 2.5 Backend orqali qilishning foydasi

- Bitta service account, kalit faqat serverda secret sifatida turadi.
- Kesh bitta joyda, kvota nazorat ostida.
- Kirish mavjud `Policies.Admin` bilan himoyalanadi, admin'larga Google akkaunt kerak emas.
- `environment` filtri va ilova bo'yicha stream ajratish bitta joyda, panel GA4 tuzilishini bilmaydi.
- Keyin shu dashboard'ga DB'dagi biznes raqamlarini (to'lov, obuna, trener soni) qo'shish oson bo'ladi.

## 3. Manba va cheklovlar

| Narsa | Qiymat |
|---|---|
| Firebase loyihasi | `tofan-68065`, Spark tarifi |
| GA4 property | `553445328`, bitta property'da hamma ilova |
| Soldier ilova | Android `com.peaktofan.tofan_tracker`, iOS `com.tofan.tofanmobile` |
| Trener ilova | Android va iOS `com.tofan.tofancoach`, trener web paneli |
| Kutubxona | `Google.Analytics.Data.V1Beta` |
| Kvota | property uchun kuniga 200 000, soatiga 40 000 token; bir vaqtda 10 so'rov |
| Kechikish | standart hisobotlar 24-48 soat, realtime oxirgi 30 daqiqa |

Bilish kerak bo'lgan cheklovlar:

- Foydalanuvchi sonlari yig'ma va taxminiy, aniq foydalanuvchi ro'yxati olinmaydi.
- Unikal foydalanuvchilar sonini kunlik qatorlardan qo'shib chiqarib bo'lmaydi: oraliq uchun jami son alohida so'rov (yoki `dateRanges` jami qatori) bilan olinadi.
- Custom dimension va metric faqat GA4'da ro'yxatdan o'tgan kundan ma'lumot yig'adi, orqaga qarab tarix bo'lmaydi.
- Foydalanuvchi kam bo'lsa, GA4 ba'zi qatorlarni yashirishi mumkin (data thresholding, Google signals yoqilgan bo'lsa).

## 4. Ishonch darajasi

Hamma ma'lumot bir xil kafolat bilan chiqmaydi.
Har endpoint ta'rifida daraja ko'rsatilgan.

| Daraja | Ma'nosi |
|---|---|
| Aniq | GA4 standart o'lchovi, ilova kodiga bog'liq emas |
| Shartli | ilova tegishli eventni yuborsa chiqadi |
| Kafolatsiz | GA4'da custom definition ro'yxatdan o'tgan va ilova parametr yuborgan bo'lishi kerak |

Eng katta xavf `environment = prod` filtri.
`environment` user-scoped custom dimension (`customUser:environment`).
U ro'yxatdan o'tmagan bo'lsa, so'rov xato beradi.
Ilova uni yubormasa, filtr hamma raqamni nolga tushiradi, shu jumladan "Aniq" darajadagilarni ham.
Trener ilova kodida bu property bor, soldier ilovada tekshirilmagan.
Taklif: filtr konfiguratsiya orqali o'chirib-yoqiladigan bo'lsin (`Analytics:EnvironmentFilter`).

## 5. Kontrakt taklifi

### 5.1 Umumiy qoidalar

- Hamma endpoint `Policies.Admin` bilan himoyalangan va `Result<T>` qaytaradi.
- Umumiy query parametrlari: `app`, `from`, `to`.
- `app` majburiy: `AnalyticsApp { Soldier = 1, Trainer = 2 }`.
  Backend uni konfiguratsiyadagi GA4 stream ID'lariga aylantiradi (`streamId` dimension filtri).
- `from` va `to` ixtiyoriy, `yyyy-MM-dd`.
  Default oxirgi 28 kun, kechagi kun bilan tugaydi.
  Oraliq 1 kundan 365 kungacha.
- `platform` enum'i: `AnalyticsPlatform { Android = 1, Ios = 2, Web = 3 }`.
- Enum'lar integer, Swagger'da `x-enumNames` bilan.
- Har javobda `from`, `to` va `generatedAt` (kesh yozilgan vaqt, ISO UTC) bor.
- Vaqt qiymatlari soniyada, ulushlar 0 dan 1 gacha kasr son.
- Ro'yxatlar kamayish tartibida va `limit` bilan (default 10, eng ko'pi 50).
- Ma'lumot bo'lmasa bo'sh massiv, blok manbasi mavjud bo'lmasa `null`. Ikkalasi ham xato emas.

Xatolar:

| Holat | Javob |
|---|---|
| GA4 javob bermadi yoki kvota tugadi | `503`, code `Analytics.Unavailable` |
| Noto'g'ri `app`, `from`, `to`, `weeks`, `limit` | `400` ValidationError |

### 5.2 `GET /admin/analytics/audience`

KPI kartochkalari va trend grafigi.
Daraja: Aniq.

`previous` shu uzunlikdagi oldingi davr: panel o'sish yoki pasayish foizini ko'rsatadi.

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "current": {
    "activeUsers": 1800,
    "newUsers": 310,
    "totalUsers": 2100,
    "sessions": 9400,
    "engagedSessions": 7100,
    "engagementRate": 0.755,
    "sessionsPerUser": 5.2,
    "averageSessionDurationSeconds": 412.0,
    "averageEngagementSecondsPerUser": 1530.0
  },
  "previous": {
    "activeUsers": 1650,
    "newUsers": 280,
    "totalUsers": 1900,
    "sessions": 8700,
    "engagedSessions": 6400,
    "engagementRate": 0.735,
    "sessionsPerUser": 5.3,
    "averageSessionDurationSeconds": 398.0,
    "averageEngagementSecondsPerUser": 1490.0
  },
  "activeUsersNow": { "daily": 120, "weekly": 540, "monthly": 1800 },
  "stickiness": { "dauPerMau": 0.067, "dauPerWau": 0.222, "wauPerMau": 0.3 },
  "userTypes": { "new": 310, "returning": 1490 },
  "series": [
    {
      "date": "2026-11-02",
      "activeUsers": 120,
      "newUsers": 9,
      "sessions": 340,
      "engagedSessions": 260,
      "averageEngagementSecondsPerUser": 380.0
    }
  ]
}
```

| Maydon | GA4 manbasi |
|---|---|
| `activeUsers`, `newUsers`, `totalUsers` | shu nomdagi metric'lar |
| `sessions`, `engagedSessions`, `engagementRate`, `sessionsPerUser` | shu nomdagi metric'lar |
| `averageSessionDurationSeconds` | `averageSessionDuration` |
| `averageEngagementSecondsPerUser` | `userEngagementDuration / activeUsers` |
| `activeUsersNow` | oraliqning oxirgi kuni uchun `active1DayUsers`, `active7DayUsers`, `active28DayUsers` |
| `stickiness` | `dauPerMau`, `dauPerWau`, `wauPerMau`, oraliqning oxirgi kuni uchun |
| `userTypes` | `activeUsers`, `newVsReturning` dimension bo'yicha |
| `series` | yuqoridagi metric'lar, `date` dimension bo'yicha, bo'sh kunlar 0 bilan to'ldirilgan |

### 5.3 `GET /admin/analytics/retention`

Qo'shimcha parametr: `weeks`, 4 dan 12 gacha, default 8.
`from` va `to` ishlatilmaydi.
Daraja: Aniq.

```json
{
  "generatedAt": "2026-11-03T08:00:00Z",
  "cohorts": [
    { "weekStart": "2026-09-07", "users": 120, "retained": [120, 64, 51, 40] }
  ]
}
```

- Manba: `cohortSpec` bilan `cohort` va `cohortNthWeek` dimension'lari, `cohortActiveUsers` va `cohortTotalUsers` metric'lari.
- Cohort: `firstSessionDate` shu haftaga tushgan foydalanuvchilar.
- `retained[0]` cohort hajmiga teng, `retained[n]` n-haftada qaytganlar soni.
- Hali kelmagan haftalar massivga kirmaydi, shuning uchun yangi cohort'larda massiv qisqaroq.

### 5.4 `GET /admin/analytics/technology`

Qo'shimcha parametr: `limit`.
Daraja: Aniq, `crashFreeUsersRate` dan tashqari.

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "platforms": [{ "platform": 1, "activeUsers": 1200, "newUsers": 200, "sessions": 6300 }],
  "appVersions": [
    { "version": "1.4.0", "platform": 1, "activeUsers": 900, "crashFreeUsersRate": 0.994 }
  ],
  "operatingSystems": [{ "name": "Android", "version": "14", "activeUsers": 640 }],
  "deviceCategories": [{ "category": "mobile", "activeUsers": 1750 }],
  "deviceModels": [{ "brand": "Samsung", "model": "SM-A546B", "activeUsers": 85 }]
}
```

| Maydon | GA4 manbasi |
|---|---|
| `platforms` | `platform` dimension |
| `appVersions` | `appVersion` va `platform` dimension'lari |
| `crashFreeUsersRate` | `crashFreeUsersRate` metric, `appVersion` bo'yicha |
| `operatingSystems` | `operatingSystem`, `operatingSystemVersion` |
| `deviceCategories` | `deviceCategory` (`mobile`, `tablet`, `desktop`), satr o'zgarishsiz qaytadi |
| `deviceModels` | `mobileDeviceBranding`, `mobileDeviceModel` |

`crashFreeUsersRate` GA4 Data API'da metric sifatida bor, lekin bizning property'da to'ldirilishi tekshirilmagan (Crashlytics SDK ilovada bo'lishi kerak).
Ma'lumot bo'lmasa maydon `null` qaytsin.

### 5.5 `GET /admin/analytics/geography`

Qo'shimcha parametr: `limit`.
Daraja: Aniq.

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "countries": [{ "countryCode": "UZ", "activeUsers": 1500, "newUsers": 260, "sessions": 8100 }],
  "cities": [{ "countryCode": "UZ", "city": "Tashkent", "activeUsers": 900 }],
  "languages": [{ "language": "Uzbek", "activeUsers": 800 }]
}
```

- `countryCode`: `countryId` dimension (ISO 3166-1 alpha-2).
  Mamlakat nomini panel o'zi uz/ru/en ga tarjima qiladi, shuning uchun nom emas, kod kerak.
- `city` va `language` GA4 bergan inglizcha nom bilan o'zgarishsiz qaytadi.
- Aniqlanmagan qiymat (`(not set)`) alohida qator bo'lib qolsin, tashlab yuborilmasin.

### 5.6 `GET /admin/analytics/screens`

Qo'shimcha parametr: `limit`.
Daraja: Shartli (`screen_view` eventi kerak).

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "screens": [
    { "screen": "HomeRoute", "views": 5400, "users": 1100, "averageEngagementSeconds": 42.5 }
  ]
}
```

| Maydon | GA4 manbasi |
|---|---|
| `screen` | `unifiedScreenName` |
| `views` | `screenPageViews` |
| `users` | `activeUsers` |
| `averageEngagementSeconds` | `userEngagementDuration / activeUsers` |

### 5.7 `GET /admin/analytics/events`

Qo'shimcha parametr: `limit`.

```json
{
  "from": "2026-10-06",
  "to": "2026-11-02",
  "generatedAt": "2026-11-03T08:00:00Z",
  "events": [{ "name": "workout_finished", "count": 1200, "users": 430, "countPerUser": 2.79 }],
  "signUps": 150,
  "logins": 900,
  "workouts": {
    "count": 1200,
    "users": 430,
    "averageDurationMinutes": 52.5,
    "averageCompletedSets": 18.2,
    "newPersonalRecords": 310,
    "bySource": [{ "source": "session", "count": 800 }],
    "series": [{ "date": "2026-11-02", "count": 40 }]
  },
  "foods": {
    "count": 6000,
    "users": 520,
    "totalQuantityGrams": 1450000,
    "bySource": [{ "source": "photo_scan", "count": 700 }],
    "byMealType": [{ "mealType": "breakfast", "count": 1500 }],
    "series": [{ "date": "2026-11-02", "count": 210 }]
  }
}
```

| Maydon | Daraja | GA4 manbasi |
|---|---|---|
| `events` | Aniq | `eventName` dimension, `eventCount`, `activeUsers`, `eventCountPerUser` |
| `signUps`, `logins` | Shartli | `eventCount`, `eventName` = `sign_up`, `login` |
| `workouts.count`, `users`, `series` | Shartli | `eventName` = `workout_finished` |
| `workouts.averageDurationMinutes` | Kafolatsiz | `averageCustomEvent:duration_minutes` |
| `workouts.averageCompletedSets` | Kafolatsiz | `averageCustomEvent:completed_sets` |
| `workouts.newPersonalRecords` | Kafolatsiz | `customEvent:new_personal_records` yig'indisi |
| `workouts.bySource` | Kafolatsiz | `customEvent:source` |
| `foods.count`, `users`, `series` | Shartli | `eventName` = `food_logged` |
| `foods.totalQuantityGrams` | Kafolatsiz | `customEvent:quantity_grams` yig'indisi |
| `foods.bySource`, `byMealType` | Kafolatsiz | `customEvent:source`, `customEvent:meal_type` |

- `events` ro'yxati GA4 yuborgan hamma eventni o'z nomi bilan qaytaradi, shu jumladan avtomatiklarini (`first_open`, `session_start`, `app_update`, `app_remove`).
- Kafolatsiz maydon manbasi ro'yxatdan o'tmagan bo'lsa, faqat o'sha maydon `null` qaytadi, qolganlari to'ladi.
- Event umuman kelmagan bo'lsa, `workouts` yoki `foods` bloki butunlay `null`.

### 5.8 `GET /admin/analytics/realtime`

Faqat `app` parametri.
Daraja: Aniq.

```json
{
  "generatedAt": "2026-11-03T08:00:00Z",
  "activeUsers": 14,
  "byMinute": [{ "minutesAgo": 0, "activeUsers": 3 }],
  "platforms": [{ "platform": 1, "activeUsers": 10 }],
  "appVersions": [{ "version": "1.4.0", "activeUsers": 9 }],
  "countries": [{ "countryCode": "UZ", "activeUsers": 13 }],
  "screens": [{ "screen": "HomeRoute", "views": 22 }],
  "events": [{ "name": "screen_view", "count": 85 }]
}
```

- Manba: `runRealtimeReport`.
- Realtime'da mavjud dimension'lar: `appVersion`, `city`, `country`, `countryId`, `deviceCategory`, `eventName`, `minutesAgo`, `platform`, `streamId`, `unifiedScreenName`.
- Realtime'da mavjud metric'lar: `activeUsers`, `eventCount`, `keyEvents`, `screenPageViews`.
- `byMinute` 30 ta nuqta (`minutesAgo` 0 dan 29 gacha), bo'sh daqiqalar 0 bilan.
- User-scoped custom dimension realtime'da ishlaydi, demak `environment` filtri shu yerda ham qo'llanadi.
- Event-scoped custom dimension realtime'da ishlamaydi, shuning uchun bu yerda mashg'ulot va ovqat tafsilotlari yo'q.

### 5.9 Kesh

| Endpoint | Kesh muddati |
|---|---|
| `audience`, `technology`, `geography`, `screens`, `events` | 1 soat |
| `retention` | 6 soat |
| `realtime` | 60 soniya |

Kesh kaliti: endpoint, `app`, `from`, `to`, `weeks`, `limit`.
Dashboard ochilganda panel 7 ta so'rovni parallel yuboradi, shuning uchun kesh bo'lmasa GA4'ning "bir vaqtda 10 so'rov" chegarasiga tez yetamiz.

### 5.10 Konfiguratsiya

- `Analytics:PropertyId = 553445328`
- `Analytics:Streams:Soldier` va `Analytics:Streams:Trainer`: GA4 stream ID ro'yxatlari
- `Analytics:EnvironmentFilter`: `prod` yoki bo'sh (bo'sh bo'lsa filtr qo'llanmaydi)
- Service account kaliti secret orqali, repo'da turmaydi
- Service account GA4 property'da faqat Viewer roliga ega

## 6. Qamrovga kirmaydi

| Narsa | Sabab |
|---|---|
| Crash ro'yxati, stack trace, xato turlari | Crashlytics'da o'qish API'si yo'q, BigQuery eksporti va Blaze tarifi kerak |
| Push yetkazilish statistikasi | FCM API faqat Android uchun yig'ma ma'lumot beradi |
| Ilova tezligi (Performance Monitoring) | o'qish API'si yo'q |
| To'lov, obuna, trener soni | Firebase'da yo'q, bizning DB'dan alohida ish |
| Yosh, jins, qiziqishlar | Google signals kerak, kichik auditoriyada GA4 yashiradi |
| Funnel va user-level tahlil | to'liq faqat BigQuery'da |
| O'rnatish manbasi (kampaniya) | hozir reklama kampaniyasi yo'q, keyin alohida endpoint bilan qo'shiladi |

## 7. Mening tomonimdan

GA4 property'ni tayyorlayman, backend ishi boshlanishidan oldin:

- Data retention: event va user data 14 oy.
- User-scoped custom dimension: `environment`.
- Event-scoped custom dimension: `source`, `meal_type`.
- Event-scoped custom metric: `duration_minutes`, `completed_sets`, `new_personal_records`, `quantity_grams`.
- Har stream ID'ni yozib beraman: soldier Android, soldier iOS, trener Android, trener iOS, trener web.
- Service account yarataman, Viewer roli beraman, kalitni xavfsiz kanal orqali topshiraman.
- Soldier ilova `sign_up`, `login`, `workout_finished`, `food_logged` eventlari va `environment` property'sini yuborishini GA4 console'da tekshirib, natijasini yozaman.

Endpoint'lar stage Swagger'da chiqqach dashboard'ni yozaman: service, DTO, mapper, store, grafiklar, uz/ru/en tarjima.

## 8. Javob kutayotgan savollar

1. Kontrakt shu ko'rinishda ma'qulmi: 7 ta alohida endpoint yoki boshqacha bo'lish qulaymi?
2. Qaysi modulga joylashadi va taxminan qachon stage'ga chiqadi?
3. Bosqichlab chiqarish mumkinmi: avval `audience`, `retention`, `realtime`, keyin qolganlari?
4. Service account kalitini qaysi yo'l bilan topshiray (secret manager, Swarm secret, boshqa)?
5. Kesh uchun mavjud mexanizm (Redis yoki memory cache) ishlatiladimi?
