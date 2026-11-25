# Discounts feature

## Purpose
Marketing sets discounts without an app release: dated campaigns (holidays, announced sales) and a per-user
"buy within N minutes" timer, separately for Tofan tariffs (Standard, VIP) and for coach subscriptions.
Coaches cannot change discounts; only the admin panel can.

## Backend
- Base routes: `/admin/tariff-campaigns`, `/admin/tariff-timer`, `/admin/trainer-campaigns`, `/admin/trainer-timer`;
  `GET /admin/trainers` for the coach picker (first 100).
- Contract: backend `docs/tariff-discounts-v1.md` and `docs/trainer-discounts-v1.md`.
- Access: `Policies.Admin` on every endpoint.
- Error codes the backend may return: `TariffCampaign.*`, `TrainerCampaign.*` (`EndsBeforeStart`, `NoDiscount`,
  `Overlaps`, `NotFound`), `TariffTimer.NoDiscount`, `TrainerTimer.NoDiscount`. They carry the backend's three
  language messages, so `MESSAGES_BY_CODE` has no entries for them.

## Screens
| Route | Page | Access |
|---|---|---|
| `/discounts/tariffs` | `DiscountsPage` (audience `tariffs`) | admin |
| `/discounts/trainers` | `DiscountsPage` (audience `trainers`) | admin |

## Structure notes
- One page and one store serve both screens. The route provides `DISCOUNT_API` with the matching service
  (`TariffDiscountsService` or `TrainerDiscountsService`) and passes `audience` in `data`; the page reads its texts
  and whether coaches are chosen from `DISCOUNT_AUDIENCE_TEXTS`. Add a third audience by adding a route, a service
  and an entry there, not an `if`.
- The tariff service answers `listTrainers()` with an empty list, so the store loads the same three things on both
  screens.
- Campaigns are few and the backend returns them unpaged, so they are cards, not a server-paged table.
- Times are picked in the browser's time zone (`app-date-field` with `showTime`) and sent as UTC ISO strings.
- `trainerIds: null` means every coach; the "All coaches" toggle maps to it.

## Traps
- `GET /tariffs` answers with the caller's own discounted `totalPrice`. The tariff card therefore shows
  `monthlyPrice`, otherwise an admin would see a campaign price as "the user pays".
- The backend rejects two campaigns that overlap in time for the same coach (or for tariffs at all) with `409`.
- Turning the timer off stops running timers at once; the duration only affects timers that start later.
