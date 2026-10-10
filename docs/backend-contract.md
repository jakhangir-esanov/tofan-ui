# Backend contract

Verified against `D:\Projects\tofan` `origin/main` (2026-09-16) and the staging Swagger
(`https://api.157.90.117.20.sslip.io/swagger/v1/swagger.json`, 151 operations). Read before writing
any service code. DTOs are hand-written; when the backend changes, compare them against the
staging Swagger.

## Base

- Base URL token: `API_BASE_URL` (`core/http/api-base-url.ts`), from `environment.apiBaseUrl`.
  Development uses `/api`, proxied to the backend by `proxy.conf.json`.
- Routes have no `/api` prefix on the backend itself: `GET /exercises`, `POST /files`.
- Auth: `Authorization: Bearer <access_token>` from Keycloak (realm `tofan`), obtained through
  `POST /auth/login` and attached by `core/auth/auth-token.interceptor.ts` for `API_BASE_URL` requests only.
- JSON is camelCase. Enums travel as integers (see "Enums").

## Paging

Request query parameters (`PagingRequest<T>` in `Tofan.Common.Application.Paging`):

```
First=<row offset>&Rows=<page size, 1..1000, default 10>&SortField=<snake_case column>&SortOrder=1|-1
```

- Offset based, not page based: page 3 of 25 rows is `First=50&Rows=25`.
- `SortField` must be the **snake_case** name of a property of the response DTO (`name_uz`,
  `created_on_utc`). Anything else is silently replaced by `id`. `core/http/paging.mapper.ts` converts camelCase.

Response shape (`PagedList<T>`), returned as is, not wrapped in `Result`:

```json
{ "data": [], "totalCount": 0 }
```

## Success envelope

Commands and single-item queries return `Result` / `Result<T>` with status 200:

```json
{
  "isSuccess": true,
  "isFailure": false,
  "error": { "code": "", "message": "", "messages": { "en": "", "uz": "", "ru": "" }, "type": 0 },
  "data": {}
}
```

`Result` without data has no `data` property. `core/http/ApiClient` unwraps `data`; a failed envelope
with status 200 is not expected but is mapped to an error class as well.

## Errors

Failures are RFC 7807 ProblemDetails built by `ApiResults.Problem`:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Exercise.NotFound",
  "status": 404,
  "detail": "The exercise was not found.",
  "messages": {
    "en": "The specified exercise was not found.",
    "uz": "Ko'rsatilgan mashq topilmadi.",
    "ru": "Указанное упражнение не найдено."
  },
  "errors": [
    {
      "code": "NotEmptyValidator",
      "message": "'Title' must not be empty.",
      "messages": { "en": "…", "uz": "…", "ru": "…" },
      "type": 2
    }
  ]
}
```

Since backend commit `203860a` (`tofan/docs/mobile-errors-v1.md`) every error response carries
`messages: { en, uz, ru }`, including 409 `Conflict.DuplicateKey` and 500, and so does every item of
`errors`. `title`, `detail` and `message` keep their English values. A 500 answers with the generic
`General.Unexpected` text, never the exception message. Custom validation rules now report their own
code instead of `PredicateValidator` (`Profile.InvalidTimeZone`, `GoalProfile.TrainingDaysNotUnique`,
`Food.ServingSizeGramsMismatch`, ...). Keycloak login/refresh failures no longer put Keycloak's raw text
in `detail`.

| Backend `ErrorType` | Status                                                 |
| ------------------- | ------------------------------------------------------ |
| Validation          | 400 (`title` = `General.Validation`, `errors` present) |
| Problem             | 400                                                    |
| NotFound            | 404                                                    |
| Conflict            | 409                                                    |
| Failure             | 500 (`title` = `Server failure`)                       |
| Unhandled exception | 500 (`title` is the exception message)                 |

Unique-constraint races answer 409 with `title` `Conflict.DuplicateKey`.

Frontend mapping (`core/http/api-error.mapper.ts`) turns failures into error classes from
`shared/models/errors`, each with the backend `code`, `message` and `messages` (a `LocalizedText`,
`undefined` when the response had none, for example a network failure):

| Status / envelope type           | Class                                                   |
| -------------------------------- | ------------------------------------------------------- |
| 400 with `errors` / `Validation` | `ValidationError` (`issues`: code + message + messages) |
| 400 without `errors` / `Problem` | `BusinessRuleError`                                     |
| 401                              | `SessionExpiredError` (`core/auth`)                     |
| 403                              | `AccessDeniedError`                                     |
| 404 / `NotFound`                 | `NotFoundError`                                         |
| 409 / `Conflict`                 | `ConflictError`                                         |
| network failure, 5xx / `Failure` | `ServiceUnavailableError`                               |

Validation issues carry the FluentValidation _validator_ code (`NotEmptyValidator`) and, since
backend `admin-ui-v1`, an optional camelCase `propertyName` (`nameUz`, `meals[0].items[1].quantityGrams`).
The panel does not map `propertyName` yet and shows the issues as a list (`docs/deferred.md`).

A 5xx keeps the ProblemDetails `title` as the `ServiceUnavailableError` code, so a known server failure
(`GetUsersQuery` when Keycloak cannot be read) can get its own message.

## Enums

Integers with `x-enumNames` in the spec. Models use camelCase string unions whose members are
the enum names (`FullBody` -> `fullBody`); DTO files declare a TS `enum` and mappers convert by name
with `shared/utils/enum-map.ts`. Some enums start at 1 (`ExerciseType`, `ExerciseDifficulty`), some at 0
(`MuscleGroup`), so never map by index.

## Error codes by feature

User-facing text comes from `core/feedback/error-message.ts`: first a per-code message
(`MESSAGES_BY_CODE`), otherwise a generic message per error class.

| Feature          | Codes                                                                                                                                                                                                                                                                                                     | How they are shown                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| auth             | Authentication.InvalidCredentials, Authentication.InvalidRefreshToken, IdentityProvider.UserNotFound                                                                                                                                                                                                      | per-code message                                                                                              |
| notifications    | NotificationTemplate.Conflict, NotificationTemplate.NoActiveTemplate, NotificationPreference.Disabled, PushNotification.NoActiveDevice, PushNotification.DispatchFailed, PushNotification.Disabled, PushNotification.ConfigurationInvalid, UserId.Empty, UserId.Invalid, Data.KeyEmpty, Data.KeyDuplicate | per-code message                                                                                              |
| accounts         | User.NotFound, User.AlreadyBlocked, User.NotBlocked, User.CannotBlockSelf, GetUsersQuery (500)                                                                                                                                                                                                            | per-code message                                                                                              |
| soldiers         | Profile.NotFound                                                                                                                                                                                                                                                                                          | not an error: "onboarding not finished" state                                                                 |
| media            | StoredFile.InUse, StoredFile.NotFound                                                                                                                                                                                                                                                                     | per-code message                                                                                              |
| exercises, foods | Exercise.NotFound, Food.NotFound                                                                                                                                                                                                                                                                          | generic `NotFoundError` message                                                                               |
| garments         | Garment.NotFound, Garment.ManufacturedInFuture, Garment.NotClaimed, Garment.StatusNotAllowed, Garment.CannotDeleteClaimed (backend); Garment.MonthsOutOfRange (panel rule, `models/garment-extension.ts`); Drop.NotFound, Drop.VariantNotFound, Drop.SoldOut (backend `messages`)                         | per-code message                                                                                              |
| file upload      | StoredFile.Empty, StoredFile.UnsupportedContent, StoredFile.TooLarge                                                                                                                                                                                                                                      | thrown before the request by `shared/utils/file-upload-rules.ts` as `BusinessRuleError`; its message is shown |

## Identity administration

Account administration goes through backend endpoints only: `GET /admin/users`, `GET /admin/users/{id}`,
`GET /admin/users/{id}/roles`, `POST /admin/users/{id}/block|unblock|logout-all` (see
`docs/modules/accounts.md`). Role assignment and account deletion do not exist yet.
The panel never calls Keycloak's `/admin/realms/{realm}/...`; the backend reaches Keycloak through
`IIdentityProviderClient` / `KeycloakAdminClient` in its Auth module.

## Permissions

The backend has one authorization policy.

| Backend                                                                | Frontend                                                        |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Policies.Admin` = `"AdminOnly"`, requires Keycloak realm role `admin` | `authGuard` checks `AuthStore.isAdmin()` (`core/auth/roles.ts`) |

Several endpoints the panel reads only require authentication (`/files`, `/exercises` GET,
`/diet/foods` GET); see `docs/deferred.md`.

## Endpoints per feature

One section per feature in `docs/modules/<feature>.md`.
