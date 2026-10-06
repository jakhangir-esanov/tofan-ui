Status: ready-for-agent

# Trenerlar moduli (admin): trenerlar va obunalar

Manba: `grill.md` (qarorlar), dizayn variant B (https://claude.ai/artifact/QDrjfnSWoUxGY26PT7NyCV), `admin-ui-trainer-v1.md` va `v2-trainer-overview.md` hujjatlari, staging Swagger.

## Problem Statement

Tofan ilovasida foydalanuvchi trener tanlab, 1 oylik obuna oladi va shundan keyin uning mashq va ovqatlanish rejasi trener tuzgan dasturga almashadi. Hozir admin panelda trenerlar bilan ishlash uchun hech qanday ekran yo'q. Admin trener kartasini yarata olmaydi, trenerni ro'yxatga chiqara yoki olib tashlay olmaydi, foydalanuvchiga obuna bera olmaydi va obunani tugata olmaydi. Hozircha to'lov yo'q, shuning uchun obunani faqat admin beradi va bu amallarni backend API orqali bajarish mumkin, lekin panelda ularni bajaradigan joy yo'q.

## Solution

Admin panelga "Trenerlar" bo'limi qo'shiladi: menyuda "Trenerlar" guruhi va undagi bitta band. Band bitta sahifani ochadi, sahifada ikkita tab bor: "Trenerlar" va "Obunalar". Admin trenerlarni ko'radi, yangi trener kartasini yaratadi, trenerni e'lon qiladi yoki ro'yxatdan oladi va foydalanuvchiga obuna beradi. Obunalar tabida barcha obunalarni filtrlab ko'radi, yangi obuna beradi va faol obunani tugatadi. Ekranlar mavjud ekranlar (hisoblar, NFC futbolkalar) bilan bir xil ko'rinishda va xatti-harakatda bo'ladi. Trener paneli (`/coach/*`) bu spec doirasida emas.

## User Stories

1. As an admin, I want a "Trenerlar" group in the sidebar menu, so that I can reach trainer management like any other section.
2. As an admin, I want the trainers screen to open on the "Trenerlar" tab by default, so that I see the trainers first.
3. As an admin, I want to switch between "Trenerlar" and "Obunalar" tabs, so that I manage both without leaving the section.
4. As an admin, I want each tab to have its own address, so that I can bookmark it or reload the page and stay on the same tab.
5. As an admin, I want the menu item to stay highlighted on both tabs, so that I know which section I am in.
6. As an admin, I want a list of trainers with server-side paging, so that a long list stays fast.
7. As an admin, I want to sort trainers by name, monthly price and creation date, so that I can find the one I need.
8. As an admin, I want to see each trainer's photo, name and bio in the list, so that I can recognise them.
9. As an admin, I want initials shown in place of the photo when a trainer has no photo, so that every row still has an avatar.
10. As an admin, I want to see each trainer's user ID, so that I can match the card to an account.
11. As an admin, I want to see the monthly price formatted in so'm, so that I can read it at a glance.
12. As an admin, I want to see "Belgilanmagan" when the trainer has not set a price, so that I understand the price is missing, not zero.
13. As an admin, I want to see whether each trainer is published or a draft, so that I know who users can choose.
14. As an admin, I want to see the creation date, so that I know how long a trainer has existed.
15. As an admin, I want a count of trainers in the header, and "—" when the list failed to load, so that a failure never looks like an empty list.
16. As an admin, I want a clear message and a retry button when the trainers fail to load, so that I can recover without reloading the page.
17. As an admin, I want a friendly empty state when there are no trainers, so that the screen does not look broken.
18. As an admin, I want an "add trainer" button, so that I can create a trainer card.
19. As an admin, I want the add dialog to ask for the Keycloak user ID and a display name, so that the card is tied to the right account.
20. As an admin, I want a hint in the dialog that the account must already have the trainer role in Keycloak, so that I do not create a card for an account that cannot sign in.
21. As an admin, I want the dialog to reject an ID that is not a UUID before sending, so that I get an instant error instead of a server round trip.
22. As an admin, I want the dialog to reject an empty display name, so that no nameless trainer is created.
23. As an admin, I want a clear error when a card already exists for that account, so that I know not to create it twice.
24. As an admin, I want the dialog to close and the list to refresh after a successful create, so that I see the new trainer immediately.
25. As an admin, I want the dialog to stay open with my input when creating fails, so that I can correct and retry.
26. As an admin, I want a success toast naming the new trainer, so that I get confirmation.
27. As an admin, I want to publish a draft trainer, so that users can see and choose them in the app.
28. As an admin, I want to unpublish a published trainer, so that new users can no longer choose them.
29. As an admin, I want the publish button to stay available for a trainer without a price, so that I am not blocked by a hidden rule; the server tells me why it refuses.
30. As an admin, I want a clear message that the trainer has not set a price when publish is refused, so that I know to ask the trainer.
31. As an admin, I want the list to refresh after publish or unpublish, so that the status tag is current.
32. As an admin, I want a "grant subscription" action on each trainer row, so that I can subscribe a user to that trainer directly.
33. As an admin, I want the grant dialog opened from a trainer row to show that trainer as fixed and read-only, so that I cannot pick the wrong one.
34. As an admin, I want to pick the user in the grant dialog from an autocomplete of soldiers and enter the number of months, so that I define who and for how long without typing a UUID.
34a. As an admin, I want the soldier autocomplete to show the first 10 soldiers when I open it without typing, and to search by name or username as I type, so that I can find the person quickly.
35. As an admin, I want the months limited to 1 through 12 with a stepper, so that I cannot enter an invalid length.
36. As an admin, I want a hint that granting to a trainer the user already follows extends the term, so that I understand the outcome.
37. As an admin, I want a clear error when the user already has an active subscription to another trainer, so that I know to end that one first.
38. As an admin, I want a clear error when the trainer has not published a workout program or a meal program, so that I know why the grant was refused.
39. As an admin, I want a clear error when the trainer is not found, so that I understand the card may have been removed.
40. As an admin, I want a neutral success toast after granting, so that I get confirmation without a claim about whether the term was created or extended.
41. As an admin, I want a list of all trainer subscriptions with server-side paging, so that a long history stays fast.
42. As an admin, I want to filter subscriptions by trainer, so that I can see one trainer's followers.
43. As an admin, I want to filter subscriptions by user ID, so that I can see one user's history.
44. As an admin, I want to filter subscriptions by status (active or ended), so that I can see only what is currently running.
45. As an admin, I want a typed user ID filter to be applied only when it is a valid UUID and to warn me otherwise, so that I do not send meaningless queries.
46. As an admin, I want filter input to be applied after I stop typing, so that the server is not hit on every keystroke.
47. As an admin, I want a "Tozalash" button to reset all filters, so that I can start over quickly.
48. As an admin, I want a filter change to return me to the first page, so that I do not land on an empty page.
49. As an admin, I want the trainer filter to list existing trainers by name, so that I do not type IDs.
50. As an admin, I want each subscription row to show the trainer, the user, the start date and the end date, so that I see the full term.
51. As an admin, I want a subscription to read "Faol" while it has not been ended and its end date is in the future, so that status matches reality.
52. As an admin, I want a subscription to read "Tugagan" when it was ended or its term has passed, so that I do not need to tell an admin cancellation from automatic expiry, which the server does not distinguish.
53. As an admin, I want the moment an ended subscription was closed shown under its status, so that I know when it stopped.
54. As an admin, I want to sort subscriptions by start and end date, so that I can order the history.
55. As an admin, I want a "grant subscription" button on the subscriptions tab, so that I can grant without going to the trainers tab.
56. As an admin, I want the grant dialog opened from the subscriptions tab to let me choose the trainer, so that I can pick any trainer.
57. As an admin, I want the list to refresh after granting from the subscriptions tab, so that the new subscription appears.
58. As an admin, I want an "end subscription" action only on active subscriptions, so that I cannot end something already ended.
59. As an admin, I want a confirmation before ending a subscription, so that I do not end one by accident, since the user returns to their own plan.
60. As an admin, I want the confirmation to explain that the user returns to their own workout and meal plan, so that I understand the consequence.
61. As an admin, I want the list to refresh and a toast to appear after ending a subscription, so that I see the result.
62. As an admin, I want failed writes to show a toast with a readable message instead of failing silently, so that I always know what happened.
63. As an admin, I want all texts in Uzbek, Russian and English following the panel language, so that the section matches the rest of the panel.
64. As an admin, I want backend error messages shown in my panel language, so that I never read an English technical message.
65. As an admin, I want the section to follow the light and dark theme, so that it looks like the rest of the panel.
66. As an admin, I want the section to use the same table, filter, dialog, tag and button look as existing screens, so that it feels like one product.
67. As an admin, I want icon-only row buttons to have accessible labels and tooltips, so that I can use them with a keyboard and a screen reader.
68. As a developer, I want the feature to be removable by deleting its folder and its route and menu entries, so that the architecture rule about independent features holds.

## Implementation Decisions

**Scope and access**
- One new admin feature, "trainers". The panel stays admin-only: no trainer role, no trainer panel, no calls to the coach endpoints.
- Backend endpoints used: create trainer, list trainers, publish trainer, unpublish trainer, grant subscription to a trainer, list subscriptions, end subscription. One extra read: a file's content, used only to display the trainer photo. No endpoint to read or edit a single trainer exists and none is used.
- The backend is the only authority for rules (price required to publish, one active subscription per user, programs published). The panel validates only for convenience and never disables an action in advance because of those rules; the server's refusal is shown as a toast.

**Navigation and structure**
- Menu: a new "Trenerlar" group with one item. The item stays active on both tabs.
- One parent page hosts the title and the tab bar and renders the active tab as a child route. The two tabs are separate routed child pages, each with its own store provided by that page, so the address reflects the tab and state resets when switching.
- Two tab routes: the trainers list (default) and the subscriptions list.
- Page titles for both routes use the panel's title mechanism.

**Modules**
- Models (plain TypeScript): a trainer, a trainer draft with its preparation rule, a subscription grant with its range rule, a trainer subscription with a status rule, a subscription filter, a subscription status union, and label and severity tables.
- Services: one service for trainers (list, create, publish, unpublish, photo URL building) and one for subscriptions (list, grant, end). DTOs mirror the Swagger exactly. Mappers convert DTO to model; the trainer mapper receives a function that builds the photo URL so the mapper stays pure.
- Stores: a trainers store and a subscriptions store. The subscriptions store also loads a trainer list (first 100) to feed the trainer filter and the grant dialog. Both stores can grant a subscription; the granting rule lives in the shared model rule, not duplicated logic.
- Soldier lookup (added after the first version): the grant dialog picks the user from an autocomplete backed by the soldiers list endpoint with its search text and a page of 10. It is read through the feature's own small service and DTO (a feature never imports another feature). A small store per page holds the suggestions, ignores answers from older searches and flags a failed search. The autocomplete opens with the first 10 soldiers on focus or click and searches as the admin types.
- Components: a form dialog to add a trainer, a grant dialog (trainer fixed or selectable), and a subscription filters component. Both dialogs use signal forms and the shared form dialog, select, number and text wrappers.
- Shared pieces reused as they are: the server-paged data table, the form dialog, the field error, the select, number and text field wrappers, the confirm dialog service, the notification service.

**Behaviour rules**
- Subscription status: active when it was not ended and its end date is later than now; ended otherwise. "Now" is passed in, never read inside the rule.
- A subscription can be ended only while active.
- Trainer "has price" means the monthly price is greater than zero; the list shows "Belgilanmagan" otherwise.
- Initials come from the first letters of up to the first two words of the display name.
- Draft preparation: trim both fields; the user ID must be a UUID; the display name must not be empty. Violations are validation errors with codes the error-message layer maps to translated texts.
- Grant preparation: the user ID must be a UUID; months must be a whole number from 1 to 12.
- The subscription filter's status maps to the backend's active flag. Ended maps to false.
- Sorting uses only the paging sort field and order. The set of valid sort fields for subscriptions is not confirmed by the backend; the table offers sorting on start and end date and the risk is accepted.
- Lists reload after every successful write. A failed read clears the rows, shows the error inline and offers retry, and raises no toast.

**Error handling**
- New backend error codes get translated texts in all three languages: trainer price not set, trainer not found, another trainer already active, workout program missing, meal program missing. Client-side codes for an empty display name and months out of range get texts too. The generic duplicate-key conflict keeps its generic conflict text.

**i18n**
- A new translation group for the feature in uz, ru and en, new menu and title keys, new error keys. No UI text in templates or code outside the dictionaries.

**Documentation**
- A module document for the feature in the modules docs folder, using the template.

## Testing Decisions

**What makes a good test here.** It checks what a user or the next layer can observe: the rows a store exposes, the calls made to the service, the toast shown, the state after a failure. It does not check private signals, call order of internals or markup of the UI library. Names follow "should <result> when <condition>"; time is passed in explicitly.

**Seams (agreed).**
1. **Store seam (main).** Both stores are tested with the feature services replaced by simple fakes, never the HTTP client. Covered: loading and paging, failed load clears rows and sets the error without a toast, filter returns to the first page, create, publish and unpublish with toast and reload, grant success and refusal, end with toast and reload, trainer options load and failure.
2. **Model rule seam.** Plain unit tests for the draft preparation, the grant preparation (range edges 1 and 12, 0 and 13, non-integer), subscription status around the end date and the ended flag, can-end, has-price and initials.
3. **Mapper seam.** Plain unit tests for DTO to model for trainers (with and without photo and bio) and subscriptions (with and without an end timestamp), the grant request body, and the filter query including the status to active-flag mapping.

**Component tests.** Only where a component has its own logic, following the existing filter component test: the subscription filters emit a trimmed, valid-only filter after the debounce, ignoring an invalid user ID. No snapshot tests of UI library markup.

**Prior art.** The garments store test (service fakes, error and reload expectations), the garments and accounts mapper tests, the garment draft and extension tests, the accounts filter component test.

**Done criteria.** Lint (including the no-comments and module-boundary checks), tests and build pass; no cross-feature imports; no `any`; no comments in files.

## Out of Scope

- The trainer panel and all coach endpoints: profile and price, trainer exercises and foods, programs, clients and their results.
- Editing or deleting a trainer card, and changing a trainer's price from the admin side. A trainer without a price stays a draft until the trainer sets it elsewhere.
- Searching users by phone when granting a subscription; the grant dialog searches soldiers by the backend's search text. The subscriptions filter still takes a user UUID.
- Showing who granted a subscription or when it was created, and telling an admin cancellation from automatic expiry.
- A single-trainer detail page; no endpoint supports it.
- Payment, purchase through app stores, refreshing subscribers' copies of a changed program, paid video protection.
- A separate dark-theme design pass; the panel theme applies.

## Further Notes

- Open question: valid sort fields for the subscriptions list are not documented in Swagger and must be confirmed with the backend team.
- Open question: the maximum page size of the trainers list. The trainer filter and grant dialog rely on the first 100 trainers; if the backend caps lower or there are more trainers, the options will be incomplete.
- The panel and the backend already localise backend errors by returning localised messages, so the explicit code mappings are an override for the codes listed above.
- Design reference: variant B in the artifact; the page title, tabs and the header action sit in a single card, and each tab shows its own toolbar with the count and its primary action.
- Photo URLs come from the API base URL and the file content route, which is publicly readable today.
