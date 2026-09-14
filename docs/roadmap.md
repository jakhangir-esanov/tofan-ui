# Tofan admin panel — reja

> Tuzilgan: 2026-09-14. Backend holati `D:\Projects\tofan` kodi va hujjatlari
> (`CLAUDE.md`, `docs/roadmap.md`, `docs/deferred.md`) asosida tekshirilgan.
> Bajarilgan bandlar ustidan chiziladi, o'chirilmaydi.

## Hozirgi holat

- Tofan — fitnes ekotizimi: foydalanuvchilar ("soldier") mashg'ulot, ovqatlanish, faollik, vazn va
  shaxsiy moliyasini yuritadi. Backend hujjatiga ko'ra admin panel — boshqaruv, operatsiyalar va
  hisobotlar uchun.
- Backend: .NET 10 modular monolith, 14 modul, 151 endpoint. Ulardan **17 tasi admin uchun**
  (`Policies.Admin` → Keycloak `admin` realm roli). Qolganlari foydalanuvchining o'z ma'lumotlari
  (mobil ilova).
- Foydalanuvchilar ro'yxati va statistika endpoint'lari **yo'q**. `User`, `Progress`, `Shop`,
  `Payment`, `Gamification`, `AI` modullari hozircha bo'sh.
- tofan-ui: Angular 22 + Optimus UI + Sakai layout, Clean Architecture. Haqiqiy backend'ga ulangan:
  OpenAPI client production Swagger'idan, login/refresh/logout Keycloak tokenlari bilan.

---

## 0-bosqich — Poydevor: haqiqiy backend'ga ulash

Faqat tofan-ui ishi, backend'dan hech narsa kutilmaydi.

| #   | Ish                                                                                                       | Nima uchun                                                              |
| --- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 0.1 | ~~OpenAPI'ni backend Swagger'idan generatsiya qilish, `openapi/tofan-api.yaml` namunasini olib tashlash~~ | ~~Hozirgi spec to'qima~~                                                |
| 0.2 | ~~`Result<T>` javob konvertini (`isSuccess`, `data`, `error`) infrastructure qatlamida ochish~~           | ~~Backend har javobni o'raydi; `error` domain xatolariga map qilinadi~~ |
| 0.3 | ~~Haqiqiy auth: `POST auth/login`, `auth/refresh`, `auth/logout` (Keycloak tokenlari)~~                   | ~~Hozir soxta login~~                                                   |
| 0.4 | ~~`admin` rolini tekshirish (`realm_access.roles`); rol yo'q bo'lsa login rad etiladi~~                   | ~~Oddiy foydalanuvchi ham login qila oladi~~                            |
| 0.5 | ~~Token yangilash: 401 → bir marta refresh → so'rovni qayta yuborish~~                                    | ~~Sessiya tushib qolmasligi uchun~~                                     |
| 0.6 | Umumiy UI bloklari: server-side paging'li jadval, forma dialogi, o'chirishni tasdiqlash, toast            | Har modulda qayta ishlatiladi                                           |
| 0.7 | Ko'p tilli maydon komponenti (`Name` / `NameUz` / `NameRu`)                                               | Katalog ma'lumotlari uch tilda                                          |
| 0.8 | Fayl yuklash (`POST /files`, 220 MB gacha video, progress bilan)                                          | Mashq videolari                                                         |
| 0.9 | Deploy: Docker + nginx; backend stack'iga `Cors__AllowedOrigins__0` = panel domeni                        | Production'ga chiqish                                                   |

`/auth/me` endpoint'i yo'q — foydalanuvchi ismi va roli token claim'laridan olinadi.

---

## 1-bosqich — Hozir qilsa bo'ladigan modullar

Backend endpoint'lari tayyor.

| Bo'lim                    | Imkoniyatlar                                                                             | Endpoint'lar                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Mashqlar katalogi         | Ro'yxat va filtr (mushak guruhi, jihoz, qiyinlik), CRUD, faollashtirish/o'chirish, video | `exercises` CRUD, `exercises/{id}/activate`, `/deactivate`, `files`         |
| Ovqatlar katalogi         | Qidirish, shtrix-kod bo'yicha topish, CRUD                                               | `diet/foods`, `diet/foods/barcode/{barcode}`                                |
| Bildirishnomalar          | Shablonlar CRUD, maxsus yoki shablon asosida push yuborish                               | `notification-templates`, `notifications/custom`, `notifications/templated` |
| Media fayllar             | Yuklangan fayllar ro'yxati, ko'rish, o'chirish                                           | `files`, `files/{id}/content`                                               |
| Foydalanuvchi sessiyalari | Kim, qachon, qaysi qurilmadan kirgan (faqat ko'rish)                                     | `user-sessions`, `user-sessions/{id}`                                       |

Tartib: mashqlar → ovqatlar → bildirishnomalar → media → sessiyalar.

---

## 2-bosqich — Avval backend'da endpoint kerak

| Bo'lim                                                                | Backend'da nima qilinishi kerak                                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Foydalanuvchilar: ro'yxat, profil, vazn/maqsad tarixi, bloklash       | Soldier endpoint'lari faqat `me` uchun, `User` moduli bo'sh. Admin list/detail + Keycloak orqali bloklash |
| Dashboard: ro'yxatdan o'tganlar, faol foydalanuvchilar, mashg'ulotlar | Analitika query'lari (`Progress` moduli bo'sh)                                                            |
| Mashg'ulot shablonlari                                                | Shablonlar C# kodida (`WorkoutPlanTemplates*.cs`) — bazaga ko'chirish va admin CRUD                       |
| Bildirishnoma statistikasi (yuborildi / o'qildi)                      | `notification-deliveries` hozir faqat foydalanuvchining o'zi uchun                                        |
| Admin harakatlari jurnali (audit log)                                 | Yangi                                                                                                     |

---

## 3-bosqich — Kelajakdagi modullar

Backend modullari yozilgach panelga qo'shiladi: Shop (mahsulotlar, buyurtmalar), Payment (to'lovlar,
obunalar), Gamification (DP, reyting, yutuqlar), Trainer (murabbiylar va mijozlari), AI (sozlamalar).

---

## Admin panelga chiqarilmaydi

Ovqat/suv/faollik loglari, byudjet va xarajatlar, preferences, device token'lar — foydalanuvchining
shaxsiy mobil funksiyalari. Kerak bo'lsa keyinchalik faqat ko'rish rejimida, support uchun.

---

## Production'ga chiqishdan oldin (backend `deferred.md`)

Admin panel ochilgach bu bandlar yanada muhim bo'ladi:

| Band | Muammo                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------- |
| 1.9  | Access token 90 kun yashaydi; `admin` rolli bitta token tashqariga chiqqan (2026-11-26 gacha amal qiladi) |
| 1.4  | Keycloak'da brute force himoyasi va parol siyosati yo'q                                                   |
| 1.8  | Portainer va pgAdmin internetga ochiq                                                                     |
| 1.2  | Swagger production'da ochiq                                                                               |

Backend `CLAUDE.md` da frontend hali "Angular 20 + PrimeNG" deb yozilgan — Angular 22 + Optimus UI
ga yangilash kerak.

---

## Qarorlar

- 2026-09-14: panelni **faqat adminlar** ishlatadi (Keycloak `admin` realm roli). Boshqa rollar
  hozircha rejada yo'q.
- 2026-09-14: login **backend `auth/login`** orqali. Keycloak sahifasiga yo'naltirish (OIDC + PKCE)
  keyinroq ko'rib chiqilishi mumkin.

## Ochiq savollar

1. Birinchi navbatda qaysi yo'nalish kerak — katalog va kontent (1-bosqich) yoki foydalanuvchilar
   va statistika (backend ishi talab qilinadi)?
