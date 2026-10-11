# Garments feature

## Purpose

The admin manages NFC shirts. First a drop (a numbered release such as "Drop 1" with 500 shirts) and
its colour and style variants, each with one image. Then shirts one after another (drop, variant,
size, material, manufacturing date): the server gives each one the next number in its drop, a serial
number and the link to write to the chip. The admin lists and filters shirts, hides, revokes or
restores a shirt, extends the validity of an activated shirt, and exports the chip links of the
filtered shirts (for example one drop) to Excel for the print shop.

## Backend

- Base routes: `/admin/garments`, `/admin/drops` (backend Garment module, handover:
  `tofan/docs/garment-ui-v1.1.md`)
- Endpoints used: `GET /admin/garments` (paged, filters `SerialNumber` (ILIKE), `Status`, `OwnerId`,
  `DropId`, `VariantId`, `Size`, `IsClaimed`, `EditionFrom`/`EditionTo`), `POST /admin/garments`, `POST /admin/garments/{id}/status`,
  `POST /admin/garments/{id}/extend`, `DELETE /admin/garments/{id}`, `GET /admin/garments/export-links`
  (same filters, no paging), `GET /admin/drops` (every drop with its variants, no paging),
  `POST /admin/drops`, `POST /admin/drops/{id}/variants`, and `POST /files` with category
  `garmentImage` (7) for a variant image.
- A shirt has no photo of its own; the image belongs to the variant and is shown from
  `GET /files/{id}/content` (`DropsService` builds the URL).
- Access (backend policy): `Policies.Admin` on every endpoint
- Error codes handled: `Garment.NotFound`, `Garment.ManufacturedInFuture`,
  `Garment.NotClaimed`, `Garment.StatusNotAllowed`, `Garment.CannotDeleteClaimed` (per-code messages in
  `core/feedback/error-message.ts`); `Drop.NotFound`, `Drop.VariantNotFound`, `Drop.SoldOut` are shown
  from the backend's own localized `messages`.

## Screens

| Route             | Page                              | Access                   |
| ----------------- | --------------------------------- | ------------------------ |
| `/garments`       | `pages/garments-page`             | `authGuard` (admin role) |
| `/garments/drops` | `pages/drops-page` (`DropsStore`) | `authGuard` (admin role) |

## Drops and variants

- `pages/drops-page` lists the drops as cards: name, how many of the total are created (progress
  bar), a "full" tag, and the variants with their images. `components/drop-form-dialog` creates a drop
  (name, total); `components/drop-variant-form-dialog` adds a variant (style name, `#RRGGBB` colour,
  image through `shared/components/file-upload`). Neither can be edited later: the backend has no
  update endpoint, so a sold shirt's passport never changes.
- The NFC site paints its drawn shirt with the variant colour, so the colour stays a `#RRGGBB` code
  (`shared/components/color-field`, upper-cased by `createDropVariantDraft`).
- Shirts made before drops existed belong to "Drop 0", whose variants have no image (the card and the
  picker show the colour instead).

## Fields and serial number

- The create dialog picks a drop (only drops with a free number and at least one variant,
  `Drop.canTakeGarments()`), then one of its variants from image tiles
  (`components/garment-variant-picker`, a `FormValueControl`). It shows the next number
  (`issuedCount + 1 / totalQuantity`). If the chosen variant is not in the chosen drop, submit clears
  the variant so its required error shows.
- Material is free text (max. 200). Size is picked from `models/garment-catalog.ts`
  (`XS S M L XL 2XL 3XL`).
- The number in the drop (`editionNumber`) is given by the server and returned by
  `POST /admin/garments`; the created card and the toast show it. The garments page reloads the drops
  after a create or delete so the counters stay right.
- The serial number is made by the server: a ULID (26 characters, Crockford base32), returned by
  `POST /admin/garments`. The panel never builds or checks a serial number; older shirts may still
  carry a `PT-…` serial. The created card shows it large with a copy button, for the shirt label.
- Quantity: one request creates 1 to 500 shirts with the same drop, variant, size, material and date
  (`quantity`, default 1). The form also caps it at the drop's free numbers
  (`Drop.remainingEditions()`); the backend refuses a batch that does not fit with
  `Drop.NotEnoughEditions` and creates nothing. The response is an array in number order.
- Repeated entry: the create dialog stays open after a save and the fields are kept. For one shirt
  the created card shows the serial number, link and token; for a batch it shows the count, the number
  range and a button that downloads the Excel links of exactly that batch
  (`GarmentsStore.exportCreatedLinks`: drop plus `editionFrom`/`editionTo`, the batch numbers are
  consecutive), because a batch's links are only usable from the file. The form is cleared when the dialog is opened again. The dialog is `components/garment-form-dialog`;
  the card is `components/garment-created-panel`.

## Structure notes

- Filters (`components/garment-filters`, value → filter in `garment-filter.form.ts`): serial number,
  drop, variant (of the chosen drop only), size, status, owner present or not, number range in the
  drop, owner id. The toolbar export always sends the current filter, so the file holds exactly what
  the list shows.

- Clicking a row (or the serial number button, which is keyboard reachable) opens
  `components/garment-view-dialog`: every field of the row with a copy button each, the status tag,
  "copy all" as `Label: value` lines, and links to the soldier and account cards when the shirt has an
  owner. It needs no request: it shows the list row (`models/garment-details.ts` lists the fields).
  The row's own buttons stop the click, so they do not open it. The chip link is not shown because
  the list does not return it and there is no `GET /admin/garments/{id}`.
- The backend does not return the chip link in the list, only the token. The link is shown once, right
  after creation (`components/garment-created-panel`), and later only through the Excel export. The
  panel never builds a link itself: the host comes from the backend `Garment:PublicBaseUrl`.
- `GarmentStatus` (`inactive`, `active`, `hidden`, `revoked`) is the stored status. The admin can only
  set `active`, `hidden` or `revoked` (`AssignableGarmentStatus`); `Garment.statusChanges()` offers the
  ones that change something. `active` is "restore": the backend returns an unclaimed shirt to
  `inactive` and a claimed one to `active`, without extending the validity.
- Extension is offered only for claimed shirts (`Garment.canExtend()`); months are 1..24
  (`models/garment-extension.ts`). The response `data` is a plain ISO string, the new `expiresAt`.
- `export-links` is not a `Result` envelope but the `.xlsx` itself. `ApiClient.download` reads it as a
  blob, takes the name from `Content-Disposition` (fallback `garment-links.xlsx`) and turns a JSON
  error body back into a domain error; `core/feedback/FileDownloadService` saves it.
- `manufacturedAt` is a calendar day. The form works with a local date; the mapper sends that day as
  UTC midnight (`2026-08-14T00:00:00Z`, the backend needs the `Z`) and maps it back to the same local
  day (`shared/utils/calendar-date.ts`). The latest selectable day is the UTC day of now
  (`latestManufacturingDay`), because the backend compares UTC midnight with UTC now: between 00:00
  and 05:00 Tashkent time that is yesterday. The form defaults to that day.
- The status list shows `Tugagan` under the validity date when it has passed. This is display only;
  the NFC site uses the server's `isExpired`.
- Forms are Signal Forms. Optimus UI `p-select`, `p-datepicker` and `p-inputnumber` declare `min`,
  `max` and `pattern` inputs with types that clash with `FormUiControl`, so `[formField]` goes through
  `shared/components/select-field`, `date-field`, `number-field`, `choice-field` (a
  `p-selectbutton`, used for size), `color-field` and `text-field` (drop and variant names and
  material, so an empty required field is not red before it is touched). `[formField]` also rejects a
  `[min]` binding next to it, so the drop total's minimum lives only in the schema.
- Overlays (`p-datepicker`, `p-select`) are appended to `body` app-wide (`overlayAppendTo` in
  `core/config/ui.providers.ts`); inside a dialog they were clipped by the dialog content before.

- Texts are in `core/i18n/translations/{uz,ru,en}/garments.ts` (`garments.*` keys). Validator
  messages are keys too; `shared/components/field-error` translates them and fills `{maxLength}`,
  `{min}`, `{max}` from the validation error itself. The screen shows no explanatory hint texts.

## Traps

- The endpoints were not called against a running server when this screen was written (see the
  handover). Check each one in Swagger before relying on it.
- `SortField` must be the snake_case name of a response field; anything else silently sorts by `id`.
- A shirt dated today can be rejected with `Garment.ManufacturedInFuture` between 00:00 and 05:00
  Tashkent time: the backend compares UTC midnight of the day with UTC now. The panel no longer
  offers that day (see above); the real fix is a business-timezone check on the backend.
- Two admins creating shirts in the same drop at the same moment can get the same number; the backend
  refuses the second one with a 409, and the admin presses save again.
- Deleting the last created shirt of a drop gives its number back; a number from the middle is not
  reused, so that drop ends with one shirt fewer.
- Hidden and revoked shirts show `Invalid` on the NFC site, also to their owner.
- Delete is a hard delete and only for shirts nobody activated (`Garment.canDelete()`, backend
  `Garment.CannotDeleteClaimed` otherwise): a mistaken or unsold shirt. A claimed shirt is revoked
  instead, so its owner keeps the passport. The trash button is in the row and in the view dialog, both
  behind `confirmDelete`. If the link was already written to a chip, that chip now scans as not found.
- There is no regenerate-link, no transfer and no drop or variant editing on the
  backend; do not add them here without a backend endpoint.
