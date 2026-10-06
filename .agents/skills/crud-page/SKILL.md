---
name: crud-page
description: Builds a complete admin screen in the Tofan admin panel — server-paged Optimus UI table with filters, create/edit dialog with Signal Forms, activate/deactivate or delete with confirmation, and tests. Use this whenever the user asks for a list page, grid, table screen, CRUD, "ro'yxat sahifasi", "jadval", create/edit form, or management screen for any backend entity.
---

# CRUD page

## Inputs to confirm
- Feature (must exist; otherwise run the `new-feature` skill first)
- Backend endpoints: list (paged), get by id, create, update, state change/delete
- Columns, filters, form fields with validation
Ask only for what cannot be read from the backend contract or existing code.
Reference implementation: `src/app/features/exercises`.

## Build order

1. **models** — model, filter, draft with `create<Model>Draft` validation (+ spec), labels.
2. **services** — DTOs, mapper (+ spec), `<feature>.service.ts` methods on `ApiClient`.
3. **store** — `<feature>.store.ts`: page and filter signals, `loading`, `loadError`, `load()`, `applyFilter()`, `save()`,
   `remove()` / `toggleActivation()`; notify through `core/feedback`. Spec with a mocked service.
4. **components** — `<model>-form-dialog`: `shared/components/form-dialog`, Signal Forms, emits `save`.
5. **pages** — `<feature>-page`: provides the store, `app-data-table` with lazy paging, filters,
   opens the dialog, confirms deletes via `ConfirmDialogService`.
6. **routes** — route in `<feature>.routes.ts`.
7. **verify** — `npm run lint && npm test && npm run build`, then delegate to `architecture-reviewer`.

## Quality bar
- Loading, empty and error states: `app-data-table` gets `[loading]`, `emptyMessage`, `[error]` and `(retry)`.
- Page resets to the first page on filter change.
- No client-side filtering or paging.
- User-facing text in Uzbek constants (no i18n library).
