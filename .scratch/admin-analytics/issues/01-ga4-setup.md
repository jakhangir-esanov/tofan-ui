# 01 - GA4 property'ni tayyorlash

**What to build:** GA4 property `553445328` hisobot uchun tayyor bo'ladi.
Custom definition'lar faqat ro'yxatdan o'tgan kundan boshlab ma'lumot yig'adi, shuning uchun bu tiket birinchi bajariladi.

**Blocked by:** None - can start immediately

**Status:** ready-for-human

- [ ] Admin > Data retention: event va user data 14 oy
- [ ] Admin > Custom definitions, event scope dimension: `source`, `meal_type`
- [ ] Admin > Custom definitions, event scope metric: `duration_minutes` (minutes), `completed_sets`, `new_personal_records`, `quantity_grams`
- [ ] Admin > Custom definitions, user scope dimension: `environment`
- [ ] Admin > Data streams: har stream ID'si yozib olingan (soldier Android, soldier iOS, trener Android, trener iOS, trener web)
- [ ] Google Cloud'da service account yaratilgan, GA4 Property access management'da Viewer roli berilgan
- [ ] Soldier ilova `workout_finished` va `food_logged` ni yuborishi tekshirilgan (GA4 > Reports > Events)
