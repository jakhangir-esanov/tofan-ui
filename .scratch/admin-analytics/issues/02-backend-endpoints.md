# 02 - Backend: admin analitika endpoint'lari

**What to build:** .NET backend `spec.md` dagi kontrakt bo'yicha `GET /admin/analytics/overview`, `/retention` va `/realtime` ni beradi.
Ma'lumot GA4 Data API'dan (`Google.Analytics.Data.V1Beta`) o'qiladi, `environment = prod` va `app` ga mos stream'lar bilan filtrlanadi va keshlanadi.

**Blocked by:** 01

**Status:** ready-for-human

- [ ] Uch endpoint `Policies.Admin` bilan, `Result<T>` qaytaradi, Swagger'da ko'rinadi
- [ ] `AnalyticsApp` va `AnalyticsPlatform` integer enum'lari Swagger'da `x-enumNames` bilan
- [ ] Custom definition yo'q bo'lsa `workouts`/`foods` `null`, xato emas
- [ ] GA4 xatosi yoki kvota tugashi `503 Analytics.Unavailable`
- [ ] Kesh: overview 1 soat, retention 6 soat, realtime 60 soniya
- [ ] Service account kaliti secret orqali, repo'da yo'q
- [ ] Staging va prod'da ishga tushirilgan
