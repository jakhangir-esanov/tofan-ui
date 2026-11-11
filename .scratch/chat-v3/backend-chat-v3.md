# Chat — v3: xabarni o'chirish

> 2026-11-10. **Kimlar uchun:** mobil (Flutter) va trener paneli (Angular).
> v1 ([chat-v1.md](chat-v1.md)) va v2 ([chat-v2.md](chat-v2.md)) dagi hamma narsa o'z kuchida — bu hujjat faqat
> **yangi** narsani aytadi. Kod bilan ziddiyat chiqsa — kod haqiqat.
>
> Holat: unit testlar bilan tekshirilgan. Lokal API'da qo'lda, stage/prod serverda hali sinalmagan.

## 0. Qisqacha

- Har kim **faqat o'zi yuborgan** xabarni o'chira oladi. Vaqt cheklovi yo'q, obuna tugagan bo'lsa ham ishlaydi.
- Xabar **ikkala tomonda** ham yo'qoladi va **butunlay** o'chadi: "Xabar o'chirildi" degan iz qolmaydi,
  qaytarib bo'lmaydi. Biriktirilgan fayllar ham serverdan o'chiriladi.
- Ikkala tomonga SignalR orqali **`MessageDeleted`** eventi keladi.
- Yuborib bo'lingan push qaytarib olinmaydi.

## 1. So'rov

`DELETE /chat/conversations/{id}/messages/{messageId}` — tana yo'q, javob `200` `{ "isSuccess": true }`.

| Status | `title` | Qachon |
|---|---|---|
| `404` | `Chat.ConversationNotFound` | Suhbat yo'q yoki siz uning a'zosi emassiz |
| `404` | `Chat.MessageNotFound` | Xabar yo'q, boshqa suhbatniki, **suhbatdoshniki** yoki allaqachon o'chirilgan |

O'chirish tugmasini faqat `senderUserId` o'zingiz bo'lgan xabarlarda ko'rsating.

## 2. `MessageDeleted` (SignalR)

Suhbatning **ikkala** a'zosiga keladi — o'chirgan odamning boshqa qurilmalariga ham.

```jsonc
{
  "conversationId": "…",
  "messageId": "…",
  // suhbatning endi oxirgi bo'lib qolgan xabari — ro'yxat qatori uchun
  "lastMessageSenderUserId": "…", // suhbatda xabar qolmagan bo'lsa null
  "lastMessageKind": 1,           // null
  "lastMessageText": "Salom",     // ""
  "lastMessageOnUtc": "2026-11-10T09:00:00Z" // null
}
```

Nima qilish kerak:

- **Ochiq chat:** `messageId` li xabarni ro'yxatdan olib tashlang (yo'q bo'lsa — hech narsa).
- **Suhbatlar ro'yxati:** shu suhbat qatoridagi `lastMessage*` maydonlarini eventdagilar bilan almashtiring va
  qatorni `lastMessageOnUtc` bo'yicha qayta tartiblang. `lastMessageOnUtc` `null` bo'lsa suhbat bo'shab qolgan —
  qatorni ro'yxatdan olib tashlang (`GET /chat/conversations` ham bo'sh suhbatni qaytarmaydi).
- **`unreadCount`:** eventda yo'q. O'qilmagan xabar o'chirilgan bo'lishi mumkin, shuning uchun bu suhbat ochiq
  bo'lmasa `GET /chat/conversations` ni qayta oling.

```ts
// Angular
connection.on('MessageDeleted', (d: MessageDeleted) => this.store.removeMessage(d));
```

```dart
// Flutter
connection.on('MessageDeleted', (args) => store.removeMessage(MessageDeleted.fromJson(args![0] as Map<String, dynamic>)));
```

## 3. Ichki tuzilish

- Qator `chat.messages` dan o'chiriladi, `chat.message_attachments` kaskad bilan ketadi. Migratsiya yo'q.
- O'chirilgan xabar suhbatning oxirgisi bo'lsa, `conversations.last_message_*` qolgan eng yangi xabardan qayta
  to'ldiriladi (`Conversation.EndWith`). `unreadCount` xabarlar qatoridan sanalgani uchun o'zi to'g'rilanadi.
- Fayllar xabar commit bo'lgandan **keyin** Storage modulining `DeleteFileCommand` i orqali o'chiriladi.
  24 soatlik tozalash jobiga tayanib bo'lmaydi: u faqat oxirgi 3 kunda yuklangan fayllarni ko'radi.
  Fayl o'chirish muvaffaqiyatsiz bo'lsa xabar baribir o'chgan bo'ladi, fayl esa egasiz qoladi.

## 4. Yo'q (keyinroq)

"Faqat menda o'chirish", suhbatdoshning xabarini o'chirish, xabarni tahrirlash, butun suhbatni tozalash.
