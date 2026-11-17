# Trener postlari va video to'plamlar: trener paneli (2026-11-10)

Backend xabari va `trainer-posts-v1.md` (API v9.18) o'qildi.
Trener paneli (coach web) uchun 1-3 bandlar qilindi va `main` ga qo'shildi (merge `e0baf6e`).
4-6 bandlar foydalanuvchi mobil ilovasiga tegishli, bu repoda emas.
Admin paneli uchun hujjatda aytilganidek hech narsa o'zgarmadi.

Sinov: `npm run start:coach:staging`, `api.stage.peaktofan.com`, Chrome, stage coach (Stage Coach) bilan.

## Backend xabaridagi bandlar (trener paneli)

- [x] 1. Postlar: `POST/GET/PUT/DELETE /coach/posts`, body `{ title, text?, fileId? }`, `GET` `?first=&rows=` bilan 10 tadan.
- [x] 2. Video to'plamlar: qoralama yaratish, videolarni qo'shish, nom va izoh, tartib (`order`, `videos/order`), `publish` / `unpublish`, o'chirish.
- [x] 3. `VideoReady` / `VideoFailed` push'i: `postId` bo'lsa postlar sahifasi, `collectionId` bo'lsa o'sha to'plam ochiladi; avvalgi `programId` + `dayId` va `previewVideoId` o'zgarmadi.
- [x] Xato kodlari tarjima qilindi: `TrainerPost.NotFound`, `TrainerVideoCollection.NotFound`, `VideoNotFound`, `Empty`, `LimitReached`, `VideoLimitReached`, `OrderMismatch`, `VideoOrderMismatch`.

## Stage'da tekshirilgani

Video to'plamlar (push bormaydi):
- "Web test to'plam" qoralama yaratildi, `POST` javobidagi id bilan sahifa darhol ochildi.
- Videosiz `publish` tugmasi panelning o'zida to'xtatildi ("kamida bitta video qo'shing").
- 2 ta video tus orqali yuklandi va `POST .../videos` bilan qo'shildi; birinchisiga nom "Planka" va izoh "Har kuni, 3 × 10" berildi (`PUT .../videos/{videoId}`).
- Videolar tartibi almashtirildi, sahifa qayta yuklanganda tartib saqlangan.
- To'plam nomi o'zgartirildi, `publish` va `unpublish` ishladi.
- To'plamlar ro'yxatida tartib almashtirildi (`PUT /coach/video-collections/order`).
- Test to'plam videolari bilan o'chirildi. Mobil orqali yaratilgan "Grija uchun" to'plami (2 video, e'lon qilingan) faqat ochib ko'rildi, o'zgartirilmadi; tartibi qaytdi.

Postlar:
- Mobil orqali yaratilgan "2" va "First post" postlari lentada to'g'ri chiqdi (muallif, sana, poster, video holati).
- Matnli post yaratildi (16:00, Toshkent vaqti), keyin matni tahrirlandi.
- Videoli post yaratildi (16:01): avval video yuklandi, keyin `POST /coach/posts` `fileId` bilan ketdi; encode bir necha soniyada tugadi, video pleyerda o'ynadi.
- Ikkala test post 1-2 daqiqadan keyin o'chirildi.
- Validatsiya panelda ham bor: bo'sh sarlavha, va matn ham video ham yo'q holat so'rov yuborilmasdan to'xtatiladi.

Stage asl holiga qaytdi: test to'plam, ikkala test post va test namuna video o'chirildi.

## Backend'dan so'raladigan savollar

1. **Post push'lari yetib bordimi?**
   Stage Coach'ning 4 ta faol obunachisi bor: jahongir bekmurodov, Test Testov, Otabek Olimjonov, Sub User.
   2026-11-10 kuni 16:00 dagi matnli post va 16:01 dagi videoli post uchun har biri 4 tadan (jami 8 ta) type `15` push ketishi kerak edi.
   Push'lar telefonlarga yetib kelganini paneldan ko'ra olmaymiz, Hangfire job loglaridan tasdiqlay olasizmi?
2. **Push ketmasidan post o'chirilsa nima bo'ladi?**
   Videoli post encode tugashi bilan push'ga navbatga tushadi.
   Agar trener postni push job ishlashidan oldin o'chirsa, push bekor bo'ladimi yoki o'chirilgan post uchun push baribir boradimi (bosilganda `404 TrainerPost.NotFound`)?
3. **`GET /coach/posts` dagi `TrainerUserId` query parametri.**
   Swagger'da trener endpoint'ida `TrainerUserId` parametri ko'rinadi.
   Hujjatda bu parametr faqat `/me/trainer-posts` uchun aytilgan.
   Trener endpoint'ida u e'tiborga olinadimi, yoki Swagger'da tasodifan qolganmi?
4. **"2" postining videosi `Failed` holatida.**
   Mobil tester yaratgan "2" postining videosi stage'da encode bo'lmagan (`GET /files/videos` `streamStatus` 3).
   Bu yuklangan faylning o'zidan bo'lishi mumkin, lekin backend tomonda xato bor-yo'qligini ko'rib chiqsangiz bo'ladi.
5. **Taklif (shoshilinch emas): `GET /coach/posts/{id}`.**
   Trenerda bitta postni o'qiydigan endpoint yo'q.
   Shu sabab push'dagi `postId` bosilganda panel postlar ro'yxatini ochadi, aniq postni emas.
   Bu hozircha yetarli; agar mobil ilovaga ham kerak bo'lsa, endpoint qo'shish mumkin.

## Panelda qilingan, backend'ga ta'siri yo'q

- Panel sinovda mavjud xatoni topdi: nom kiritadigan oyna saqlashda bo'sh qiymat qaytarar edi (namuna video va kun videosini qayta nomlash). Bu frontend xatosi edi va tuzatildi.
- Post editori panelda alohida sahifa emas, postlar ro'yxati ustida ochiladigan oyna (yuqoridagi 5-band sababli).
