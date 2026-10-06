---
name: new-feature
description: Scaffolds a new feature folder in the Tofan admin panel (users, trainers, shop, payments or any new screen group) with pages, components, models, services, store and lazy routes. Use this whenever the user says "yangi modul", "new feature", "new module", "add <section> section", or starts work on a screen group that has no folder under src/app/features yet.
---

# New feature

## Inputs to confirm
- Feature name (kebab-case, plural, as the screen group: `users`)
- Main model name (singular PascalCase: `User`)
- Backend endpoints (check `docs/backend-contract.md` and the staging Swagger)
If the user already gave them, do not ask again. If the backend endpoint does not exist, stop and say so.

## Steps

1. Check `src/app/features/<feature>` does not exist. If it exists, stop and extend it instead.
2. Read the reference feature `src/app/features/exercises` and copy its shape.
3. Create the structure:

```text
src/app/features/<feature>/
  models/
    <model>.ts
  services/
    <model>.dto.ts
    <model>.mapper.ts
    <model>.mapper.spec.ts
    <feature>.service.ts
  pages/
  components/
  <feature>.routes.ts
```

4. `<feature>.routes.ts` template:

```ts
export const USER_ROUTES: Routes = [
  { path: '', title: 'Foydalanuvchilar', component: UsersPage },
];
```

5. Register in `src/app/routes/app.routes.ts` under the layout children:
   `loadChildren: () => import('@features/<feature>/<feature>.routes').then((m) => m.<FEATURE>_ROUTES)`.
6. Add the path to `core/config/app-paths.ts` and a menu entry to `core/layout/menu/app-menu.ts`.
7. Create `docs/modules/<feature>.md` from `docs/modules/_template.md`.
8. Run `npm run lint && npm test && npm run build`.
9. Delegate to the `architecture-reviewer` subagent and fix blocking items.

## Do not
- Create domain/application/infrastructure layers, repository abstractions, use cases or fake services.
- Import anything from another feature; move shared code to `shared/` or `core/`.
- Create pages or stores before the user asks for a screen (use the `crud-page` skill for that).
