# Habit Tracker — UI Design (`knowledgebuilder`)

## Overview

This document adapts the standalone `habit-ui` (Angular 22 SPA) from `../habit-tracker-v0.3.13/docs/ui-design.md` into the **existing `knowledgebuilder` learning app**. Habit tracking becomes a lazily-loaded feature area of knowledgebuilder — new routes, components, and a `HabitService` — reusing the app's existing authentication, HTTP interceptor, i18n, and styling infrastructure.

- Functional requirements: [`../../docs/habit-tracker-functional-spec.md`](../../docs/habit-tracker-functional-spec.md) (EN) / [CN](../../docs/habit-tracker-functional-spec-cn.md)
- Companion API design: [`../../aclearningutil/docs/design-habit-api.md`](../../aclearningutil/docs/design-habit-api.md) — the new `/api/Habits` endpoints
- Reference UI design (superseded by this doc): `habit-tracker-v0.3.13/docs/ui-design.md`

All page/component behavior (list states, progress rendering modes, wizard steps, punch dialogs, history view, template picker, preview simulation) carries over from the reference; adaptations concern the stack, contract naming (camelCase), auth reuse, and bilingual i18n.

## Tech Stack Mapping

| Concern | Reference (`habit-ui`) | This design (`knowledgebuilder`) |
|---|---|---|
| Framework | Angular 22, standalone | Angular 21+, standalone components (project standard — no NgModules) |
| Change detection | (default) | **`ChangeDetectionStrategy.OnPush`** everywhere (project standard) |
| DI | constructor | `inject()` (project standard) |
| Component toolkit | Angular Material (M2) | The app's existing shared components / UI primitives. Where this doc names Material widgets (dialog, snack-bar, date picker, progress bar/spinner), map to the equivalents already used by the learning pages — do **not** introduce a parallel component library for this feature. |
| Auth | `angular-auth-oidc-client` against a private IDP (`localhost:8990`) | The app's **existing auth against acidserver** (`https://localhost:7228` dev / `https://www.alvachien.com/idserver` prod, audience `api.knowledgebuilder`) — reuse its login/logout flow, `/callback` handling, silent renewal, and `Authorization`-attaching interceptor (extended to cover `environment.idServerUrl` as well as `environment.apiUrl`, so the acidserver user-search call carries the bearer token). No new OIDC client config for habits. |
| API target | `http://localhost:8993` (`habit-api`) | `aclearningutil`: `https://localhost:7135` (dev) / `https://www.alvachien.com/learningutil` (prod) — the app's existing API base URL config |
| i18n | `@jsverse/transloco` (en/zh) | `@jsverse/transloco` (en + zh-CN) — same library, extend the existing translation files |
| Contract casing | snake_case | **camelCase** (matches the new API design) |
| Styling | Material theme SCSS | Existing app styles (Tailwind utilities + app theme) |
| Testing | Vitest + happy-dom via `ng test` | Vitest via `ng test` (never `npx vitest` directly) |
| Deployment | own nginx container | Rides knowledgebuilder: dev on `:29800`, prod under `https://www.alvachien.com/learning/` |

## Architecture

```
knowledgebuilder (as built)
├── app.routes.ts
│     └── { path: 'habits', canActivate: [AuthGuardService], loadChildren: … habits.routes.ts }
│           ├── ''            → HabitListComponent     (auth guard)
│           ├── 'new'         → HabitWizardComponent   (auth guard)
│           ├── 'calendar'    → HabitCalendarComponent (auth guard; literal, precedes ':id')
│           ├── 'shared'      → SharedHabitListComponent  (auth guard; literal, precedes ':id')
│           ├── 'shared/:id'  → SharedHabitDetailComponent (auth guard)
│           ├── ':id/edit'    → HabitWizardComponent   (auth guard)
│           └── ':id'         → HabitDetailComponent   (auth guard)
│
├── src/app/pages/habits/                 (flat folder, standalone components)
│     ├── habits.routes.ts                — HABITS_ROUTES ('', 'new', 'calendar', 'shared', 'shared/:id', ':id/edit', ':id')
│     ├── habit.models.ts                 — camelCase TS interfaces + HabitApiError (below)
│     ├── habit.service.ts                — HttpClient wrapper for /api/Habits
│     ├── habit-list.component.{ts,html,scss}
│     ├── habit-detail.component.{ts,html,scss}
│     ├── habit-calendar.component.{ts,html,scss}      (ported second entrance — see its §)
│     ├── habit-shares-dialog.component.ts             (invitation manager dialog; inline template — see its §)
│     ├── shared-habit-list.component.ts               ("Shared with me" — read-only, inline template; see its §)
│     ├── shared-habit-detail.component.ts             (read-only invited-habit view; inline template)
│     ├── habit-page-header.component.ts  (inline template) — Habits | Calendar | Shared entrance bar
│     ├── habit-wizard.component.{ts,html,scss}
│     ├── habit-punch-dialog.component.ts        (inline template)
│     ├── habit-punch-edit-dialog.component.ts   (inline template)
│     ├── habit-criterion-summary.component.ts   (inline template)
│     ├── habit-confirm-dialog.component.ts      (ported — the app had none)
│     ├── habit-templates.ts              — the 12 FR-5.4 templates (client-side)
│     ├── habit-error-messages.ts         — error code → transloco key map + showHabitError()
│     ├── habit-date.util.ts              — Date ⇄ ISO helpers, browser/server today check
│     ├── habit-window.util.ts            — canPunchOn/canPunchToday/punchDateBounds (pure)
│     ├── habit-simulation.ts             — Step-4 preview engine (pure functions, no HTTP)
│     ├── habit.service.spec.ts / habit-templates.spec.ts / habit-error-messages.spec.ts
│
├── Existing shared infrastructure (reused, not forked):
│     AuthGuardService (class guard, as on every existing route), authInterceptor (bearer),
│     AppPageTitle (browser title per component), MatSnackBar, date-fns date adapter
│     (@angular/material-date-fns-adapter provideDateFnsAdapter — the repo standard, not
│      MatNativeDateModule). Confirm dialog: none existed, so HabitConfirmDialogComponent
│      was ported here.
│
└── src/assets/data/i18n/en.json · zh-CN.json  — extended with a nested `habits` object
    (nav label `habits.nav`, used by the navbar's full/short-text link and the mobile drawer)
```

The API is stateless and `GET /api/Habits` already embeds `progress` for every habit, so the reference approach carries over unchanged: **no state-management library**; every mutation re-fetches the affected data (FR-4.4's "live progress after each punch" is satisfied by the post-dialog refresh calls described below). Use signals for component state with `async`/`await`-style RxJS operators, subscriptions cleaned via `takeUntilDestroyed(this.destroyRef)`.

The app's navigation shell gains one entry ("Habits / 习惯打卡") linking to `/habits`, visible per the existing auth-conditional menu pattern.

## Data Models & Service

`src/app/habits/models/habit.models.ts` mirrors the API design's DTOs (camelCase on the wire; enum values remain the spec's lowercase strings):

```typescript
type HabitCycle = 'daily' | 'weekly' | 'monthly';
type HabitState = 'active' | 'inactive';
type PropertyType = 'boolean' | 'numeric' | 'list';
type ItemUniqueness = 'per_day' | 'per_cycle';
type CriterionType = 'condition' | 'composite';
type CompositeOperator = 'and' | 'or' | 'not';
type ItemScope = 'all' | 'subset';

interface CriterionProgressOut {
  criterionId: number; name: string; isRoot: boolean;
  criterionType: CriterionType; passed: boolean;
  propertyId: number | null; currentValue: number | null; threshold: number | null;
  dailyTarget: number | null; cycleTarget: number | null;
  currentDayValue: number | null; successfulDays: number | null;
  operator: CompositeOperator | null; operandIds: number[] | null;
}
interface ProgressOut {
  cycleFrom: string; cycleTo: string;
  rootCriterion: CriterionProgressOut; criteria: CriterionProgressOut[];
}
interface Habit {
  id: number; name: string; description: string | null; cycle: HabitCycle;
  startDate: string; endDate: string | null; state: HabitState;
  hasPunches: boolean; createdAt: string; progress: ProgressOut;
}
interface PropertyOut {
  id: number; itemId: number; name: string; propertyType: PropertyType;
  baseRate: number | null; itemUniqueness: ItemUniqueness | null; order: number;
  createdAt: string; currentCycleValue: number; todayValue: number | null;
}
interface HabitItem {
  id: number; habitId: number; name: string; order: number;
  createdAt: string; hasPunches: boolean; properties: PropertyOut[];
}
interface CriterionOut {
  id: number; habitId: number; name: string; isRoot: boolean;
  criterionType: CriterionType; propertyId: number | null;
  itemScope: ItemScope | null; scopeItemIds: number[] | null; threshold: number | null;
  operator: CompositeOperator | null; operandCriterionIds: number[] | null;
  dailyTarget: number | null; cycleTarget: number | null; createdAt: string;
}
interface PropertyValueOut {
  propertyId: number; propertyName: string; propertyType: PropertyType;
  boolValue: boolean | null; numValue: number | null; listEntries: string[] | null;
}
interface PunchOut {
  id: number; habitId: number; itemId: number;
  punchedAt: string; punchDate: string; createdAt: string; values: PropertyValueOut[];
}
interface CriterionDayResultOut {
  criterionId: number; name: string; passed: boolean; currentValue: number | null;
}
interface DayHistoryOut {
  date: string; isSuccessful: boolean;
  criteria: CriterionDayResultOut[]; punches: PunchOut[];
}

// Request bodies — create payloads use name-based refs; edit payloads use id-based refs.
interface PropertyCreate { name: string; propertyType: PropertyType;
  baseRate?: number; itemUniqueness?: ItemUniqueness; order: number; }
interface PropertyUpdate { name: string; baseRate?: number | null; order: number; }
interface ItemCreate { name: string; order: number; properties: PropertyCreate[]; }
interface ItemUpdate { name: string; order: number; }
interface CriterionCreateInWizard {
  name: string; isRoot: boolean; criterionType: CriterionType;
  propertyName?: string; itemScope?: ItemScope; scopeItemNames?: string[];
  threshold?: number;                       // condition, > 0
  operator?: CompositeOperator; operandCriterionNames?: string[];
  dailyTarget?: number | null; cycleTarget?: number;   // root-only
}
interface CriterionUpdate {
  name: string; isRoot: boolean; criterionType: CriterionType;
  propertyId?: number | null; itemScope?: ItemScope; scopeItemIds?: number[];
  threshold?: number;
  operator?: CompositeOperator; operandCriterionIds?: number[];
  dailyTarget?: number | null; cycleTarget?: number;
}
interface PropertyValueCreate { propertyId: number; boolValue?: boolean;
  numValue?: number; listEntries?: string[]; }
interface PunchCreate { values: PropertyValueCreate[]; }
interface PunchUpdate { values: PropertyValueCreate[]; }
interface HabitCreate { name: string; description?: string | null; cycle: HabitCycle;
  startDate: string; endDate?: string | null;
  items: ItemCreate[]; criteria: CriterionCreateInWizard[]; }
interface HabitUpdate { name: string; description?: string | null; cycle: HabitCycle;
  startDate: string; endDate?: string | null; }
```

`HabitService` (wraps `HttpClient`, all methods return `Observable<T>`, errors normalized here — see § Error Handling):

| Method | HTTP call |
|---|---|
| `getHabits()` | `GET {api}/api/Habits` |
| `createHabit(body: HabitCreate)` | `POST {api}/api/Habits` |
| `getHabit(id)` | `GET {api}/api/Habits/{id}` |
| `updateHabit(id, body: HabitUpdate)` | `PUT {api}/api/Habits/{id}` |
| `deactivateHabit(id)` | `POST {api}/api/Habits/{id}/Deactivate` |
| `deleteHabit(id)` | `DELETE {api}/api/Habits/{id}` |
| `getHistory(id, from?, to?)` | `GET {api}/api/Habits/{id}/History` |
| `getItems(habitId)` / `addItem` / `getItem` / `updateItem` / `deleteItem` | `…/Items[…]` |
| `addProperty` / `getProperty` / `updateProperty` / `deleteProperty` | `…/Items/{i}/Properties[{id}]` |
| `getCriteria` / `addCriterion` / `getCriterion` / `updateCriterion` / `deleteCriterion` | `…/Criteria[{id}]` |
| `createPunch` / `getPunch` / `updatePunch` / `deletePunch` | `…/Items/{i}/Punches[{id}]` |
| `getHabitPunches(habitId, from?, to?)` | `GET {api}/api/Habits/{id}/Punches` |
| `getItemPunches(habitId, itemId, from?, to?)` | `GET …/Items/{i}/Punches` |

`{api}` is the existing environment's learning-API base URL — in dev `https://localhost:7135`, in prod the `/learningutil` path on the same origin. No new environment file or hard-coded port. The reference `getVersion()` call is dropped: the app already surfaces/uses the API's existing health endpoint.

## Pages & Components

Behavior is inherited from the reference design; the deltas are naming (camelCase), transloco bindings on every string, and OnPush-compatible state handling (signals). Reference specifics reproduced here in brief — implementers should treat `habit-tracker-v0.3.13/docs/ui-design.md` §§ HabitListComponent / HabitDetailComponent / HabitWizardComponent / PunchDialog / PunchEditDialog / ConfirmDialog / CriterionSummary as the normative behavioral spec, with these adjustments:

### `HabitListComponent` (`/habits`)

- Loading (centered progress spinner), empty ("No habits yet" + New Habit button), error (snack-bar + Retry) states — all strings via `habits.list.*` keys.
- Cards show name/description, cycle, state badge (`active`/`inactive`), current-cycle date range, and root-criterion progress:
  - **Cumulative mode** (no `dailyTarget`): `currentValue / cycleTarget` progress bar; success when `passed`.
  - **Day-count mode**: `successfulDays / cycleTarget` passing days + secondary today label `currentDayValue / dailyTarget` while `currentDayValue !== null`; suppress the label defensively if `dailyTarget` is null (reference inconsistency guard).
- `CriterionSummaryComponent` rendered only when `progress.criteria.length > 1`.
- Per-card actions: **Punch** (opens `PunchDialog`, fetching items on demand via `getItems`; shown only when `canPunchToday(habit)` — active AND the browser's today lies in `[startDate, endDate?]`, mirroring the API's FR-3.3 `outOfWindow` rejection so the button is never a guaranteed failure), **Edit** (route to `/habits/:id/edit`), overflow menu: **Shares…** (opens `HabitSharesDialogComponent` for the per-habit invitation list — see its §), **Deactivate** (confirm dialog warning the action is permanent/irreversible; `alreadyInactive` mapped to its message, not an unexpected error), **Delete** (confirm). Card click → detail.
- Card actions row wraps on narrow cards (`mat-card-actions { flex-wrap: wrap }`) — Material's default no-wrap layout overlapped Punch/Edit/menu below ~400px card width.
- Header bar (`HabitPageHeaderComponent`, `page="list"`): three entrances — **Habits**, **Calendar** (`/habits/calendar`) and **Shared** (`/habits/shared`, `groups` icon) — as `mat-button` links; active tab is an input, not `routerLinkActive` (the directive needs `router.events`, which the shared minimal Router stubs lack).
- After punch success (`'saved'` dialog result): re-fetch `getHabit(id)` and update the list signal in place (FR-4.4).

### `HabitDetailComponent` (`/habits/:id`)

- Parallel `getHabit` + `getItems` on mount (items needed to name `PunchOut.itemId` in history).
- Metadata block; full criterion tree via `CriterionSummary` (root also shows `dailyTarget`/`cycleTarget`, `successfulDays`/`currentDayValue` where non-null).
- Items list with `currentCycleValue` / `todayValue` per property.
- History from `getHistory(id, from?, to?)`: day rows newest-first with the day/cycle-complete chip rules exactly as the reference (day-count: chip on each passing day; cumulative: "cycle complete" chip on the earliest passing day only, detected by scanning oldest→newest); expandable per-session rows with item name + per-property values; Edit/Delete per session with refresh-on-close.
- Date-range picker defaulting to the clamped current cycle (clamp `from` to `startDate`, `to` to `endDate` as the reference specifies). Arriving from a calendar day link (`/habits/:id?date=yyyy-MM-dd`) prefilters both bounds to that day (query-param read is optional-chained — the shared ActivatedRoute stubs omit `queryParamMap`).
- Punch button in the header (items already loaded), gated by `canPunchToday(habit)` like the list card. Back to `/habits`.

### `HabitCalendarComponent` (`/habits/calendar`)

Second entrance of the reference (`habit-ui/src/app/calendar`), ported: a **Punch History** calendar across all of the user's habits, complementing the per-habit history on the detail page.

- Month / week / day view modes (plain toggle), prev/next period navigation, localized period label and weekday headers (Monday-first — the API's weekly-cycle boundary; `toLocaleDateString` keyed on the active transloco language).
- Data: habits + per-habit item names load once; each navigation calls `getHabitPunches(id, from, to)` per habit (`forkJoin`) and folds the sessions into a date→count `punchMap` and a date→`{habit, item, count}` `detailMap`. The API has no cross-habit aggregate; personal-scale habit counts make the 1+N calls fine. (Improvement over the reference, which re-fetched items on every navigation.)
- Month grid: dimmed other-month cells, today highlight, `habit / item ×count` chips capped at 3 with "+N more"; week grid: 7 columns, 5 chips; day view: total + per habit/item rows sorted by session count, each linking to `/habits/:id?date=…` (detail prefilter).
- Same header entrance bar as the list (`page="calendar"`). Styling ports the reference's calendar SCSS minus its toolbar/auth chrome, mapped to the app conventions (behavioral parity goal; light-token styling like the other habit pages).

### Invitations: `HabitSharesDialogComponent` + `SharedHabitListComponent` / `SharedHabitDetailComponent`

Owner-side **Shares…** dialog (`habit-shares-dialog.component.ts`, inline template, opened from the card menu with `{ habitId, habitName }`): lists current invitees (revoke per row, no confirm), and a picker that searches acidserver `GET /api/users/search?q=` (≥2 chars, 300 ms debounced Subject+switchMap; results are `userId`/`userName` only — never emails), inviting on click. Already-invited hits render a disabled "Already invited" state (matched client-side on `userId`; the API also 422s duplicates). Invites take effect immediately — no accept step; revoking re-privatizes for that user instantly.

Viewer side (`/habits/shared`, `/habits/shared/:id`) — "Shared with me": the habits the CALLER was invited to, **read-only** (backend `api/SharedHabits`, the FR-6 invitation exception — see acllearningutil `docs/design-habit-api.md § SharedHabits`). Deliberately lean inline-template clones of the owner pages with EVERY write affordance removed, rather than parameterizing the owner components (the write paths would drag punch/edit/delete dialogs and window helpers into code that must never offer them).

- Gallery card: mirrors the list card minus all actions — owner credit first (`habits.shared.by` + `person` icon, from the server's grant name snapshot), state badge, cycle/window, progress bar, `CriterionSummary`, a `visibility` read-only chip. Card click → `/habits/shared/:id`. Same loading/failed+retry/empty signal pattern as the list.
- Detail: owner's detail page minus punch/edit/delete — meta row, tz hint, progress card, items card, clamped current-cycle date-range filter, and the day-grouped history accordion with FULL punch values (booleans ✓/✗, numerics, list entries joined) — the API grants invitees the same `DayHistoryOut` granularity the owner sees. Chips follow the same daily/cumulative rules.
- Not invited / unknown ids arrive as `notFound` from the API → generic not-found panel with a back link to `/habits/shared` (someone else's private or selectively-shared habit is never even confirmed to exist).
- Third entrance of the header bar (`page="shared"`, label `habits.navShared` = "Shared with me"/"共享给我"); routes are literals inserted **before** `':id'` (same rule as `'calendar'`); no navbar entry (reachable under the existing Habits nav item).
- Service: `getShares/addShare/deleteShare` on `api/Habits/{id}/Shares`, `searchUsers(q)` against `environment.idServerUrl` (the ONLY cross-service call — `authInterceptor` attaches the bearer token because it matches `idServerUrl` prefixes too; the token's audience `api.knowledgebuilder` is what acidserver accepts), and `getSharedHabits() / getSharedHabit(id) / getSharedHistory(id, from?, to?)` on `api/SharedHabits`. Models: `ShareGrant`, `UserSearchHit`; `SharedHabitSummary`/`SharedHabitDetail` carry `ownerName`. No `isShared` field exists on `Habit` (the earlier public-gallery flag was replaced by grants).

### `HabitWizardComponent` (`/habits/new`, `/habits/:id/edit`)

- Create mode: template picker (Step 0) → Basics → Items & Properties → Targets (templates only) → Preview; Custom template skips Targets (4 steps for templates, 3 for Custom — FR-5.3). Edit mode: Basics → Items → Criteria, pre-populated from parallel `getHabit`/`getItems`/`getCriteria`, tracking new/dirty/unchanged entities.
- The wizard is the only place criterion *editing* is exposed in this port (the reference also edits criteria only in the wizard — same here).
- Basics step cycle field is an editable `mat-select` in **every** flow: a template pre-fills its cycle (`applyTemplate`) but must not lock it (FR-5.3). The only lock is FR-2.3 — editing a habit that already has punches disables the select and shows the `cycleLocked` hint (historical cycle boundaries would become ambiguous).
- Step 2 edit-mode locks: `propertyType`/`itemUniqueness` read-only on existing properties; item delete disabled with tooltip when `hasPunches` (backend-computed all-cycles flag — do not proxy from `currentCycleValue`/`todayValue`); adding items/properties always allowed (FR-2.3).
- Step 3 Targets and Step 4 Preview (client-side animated simulation, approximate-simulation warning banner for subset scopes, cross-item composites, `per_cycle` list properties) carry over unchanged. The simulation lives in a standalone pure module `habit-simulation.ts` (`simulateCycle`/`simCycleDates`/`simulationIsApproximate`) that mirrors the API's bottom-up evaluation but never calls the server — this keeps it unit-testable and out of the component. Template labels/icons use `habits.templates.<key>` i18n keys (the 12 FR-5.4 keys with zh translations — see § i18n); at seed time `applyTemplate` maps the template through `resolveTemplate` so item/property names — and every criterion reference, incl. the `${item} ${prop}` AND-leaf names (`habits.templateItems.*` / `habits.templateProps.*`, key-echo ⇒ English-constant fallback) — translate together and the name-based criterion wiring never mixes locales.
- Targets step maps to the API's root-criterion rules: weekly ≤ 7 / monthly ≤ 31 successful days, so the spec's `meditation` default of `cycle_target: 21` is pre-filled as **5** on its weekly cycle (the API would reject 21). The user can still override within the allowed range. `buildCreatePayload` applies the "minimum per session" (threshold) override only for numeric/list condition roots, never boolean — matching the reference. The threshold override is **optional** (FR-5.3; the reference's `templateThreshold` control carries no validator): blank keeps the template's pre-filled default — which is what satisfies the API's condition-threshold-required rule — and a provided value must be > 0. The label says so (`Minimum per session (optional)` / `单次最低量（选填）`).
- Create submit: single `createHabit` with name-based `HabitCreate` payload. Edit submit: `updateHabit`, then sequential add/update/delete calls per changed item / property / criterion using id-based payloads. On a mid-sequence failure, surface the mapped error and re-fetch the habit (the API's per-endpoint transactions keep server state consistent; the wizard re-reads truth from the API — same behavior as reference, listed as a known limitation).
- Client-side validations mirror the API rules (end ≥ start; condition threshold > 0 — always in the criteria step, and in the Targets step only when the optional override is entered; cycle target ≥ 1; NOT = 1 operand, AND/OR ≥ 2; numeric punch > 0) so inline errors appear before the request. The preview simulation paces cumulative roots at `cycleTarget ?? threshold`, mirroring the API's `RootPasses`, so an override lowered below the template's threshold is reflected in the animated values too.

### `PunchDialogComponent` / `PunchEditDialogComponent`

- Punch dialog: date picker on top (default = browser-local today; bounds `punchDateBounds(habit)` = `[startDate, today]` — never future, and the picker only exists while the window is open at all). Accordion per item (first expanded), status icons (punched-this-session vs already-recorded-on-the-selected-day); boolean checkbox auto-submits a single-value punch immediately (suppressed when setting `false` with no value on the selected day); numeric/list inputs buffered and submitted on the footer Punch button as parallel `createPunch` calls (`forkJoin`) — one per item with dirty inputs; list textareas split on newlines; result `null` | `'saved'`.
  - **Day overlay**: while today is selected, the panels read/write the payload's `todayValue` exactly as before and the body omits `punchDate` (also the client/server clock-skew guard). Selecting a past day clears buffered inputs/dirty flag, then loads that day's record via `getHistory(id, D, D)` (Subject + switchMap, same stale-response pattern as the detail page) into a per-property overlay — booleans prefill the checkbox state, numeric hints show the day's base-rate-weighted total (Σ `todayValueDelta`), list hints its entry count; the overlay fully shadows `todayValue`. Inputs are never prefilled (re-submitting numeric ADDs a session; re-submitting a list entry 422s `duplicateEntry`). Submits for a past day carry `punchDate`.
  - Dialog height: component styles lift Material's default `mat-dialog-content` `max-height: 65vh` cap to `calc(100vh - 240px)` so expanded panels get sufficient room.
- Edit dialog: prefills the original session values (never the cycle total — reference note preserved); per-`per_cycle`-list uniqueness hint; date/item read-only; submits `updatePunch`. (To re-date a wrong punch: delete it and re-punch on the intended day.)
- All dialogs close with `'saved'` so parents refresh (detail page reloads habit + items + history; list page patches the one habit).

### `CriterionSummaryComponent`

- Collapsed "N / M criteria passing" chip; expanded per-criterion rows (name, pass chip, `currentValue / threshold` for leaves, operator + indented operands for composites). Input is `CriterionProgressOut[]` (non-root) — rendered only when `criteria.length > 1`.

### `ConfirmDialogComponent`

- The app had no existing confirmation dialog, so the reference's was ported as `HabitConfirmDialogComponent` (`title`, `message`, optional `confirmLabel`, result `true`/`false`); callers pass pre-translated strings. Cancel is the first focusable button, so Material's default `autoFocus` lands on the safe action.

## i18n (project requirement — new relative to reference)

Every string this feature renders goes through Transloco with both `en` and `zh-CN` translations added to the existing `src/assets/data/i18n/en.json` / `zh-CN.json` under a single nested `habits` object: navigation label (`habits.nav`, also used by the navbar desktop link and mobile drawer), list/detail/wizard/dialog chrome, validation hints, template labels, and all API error messages. Template *data* (cycle, targets, thresholds) stays in code (`habit-templates.ts`). Item and property **names** carry i18n `nameKey`s (`habits.templateItems.*` / `habits.templateProps.*` — the English constants remain the canonical id and the fallback when a key does not resolve); the wizard resolves them once at seed time via `resolveTemplate`, and the resolved strings then behave as ordinary editable user data — they are POSTed as the habit's real names (a habit created in zh-CN stores Chinese item names; switching language later never retro-changes an existing habit). Template-derived criterion names (the `Goal` root, the `${item} ${prop}` AND-leaf names) follow the same resolved strings so every name reference stays consistent.

Example (illustrative shape; full key list authored with the implementation):

```json
{ "habits": { "list": { "empty": "…", "newHabit": "…", "deactivate": "…" },
             "wizard": { "stepBasics": "…", "stepItems": "…", "stepTargets": "…", "stepPreview": "…" },
             "punch": { "title": "…", "today": "today: {{value}}" },
             "templates": { "morning_exercise": "Morning Exercise", "running": "Weekly Running", "…": "…" },
             "errors": { "notFound": "…", "duplicateEntry": "…", "…": "…" } } }
```

The zh.json content can start from the translated strings in [`docs/habit-tracker-functional-spec-cn.md`](../../docs/habit-tracker-functional-spec-cn.md) terminology (习惯 / 项目 / 属性 / 成功标准 / 打卡 / 周期).

## Error Handling

`HabitService` normalizes failures: parse the `ProblemDetails` body, take `code` (plus `detail`), and map `code` → transloco key in `habits.errors.*` (same table as the API design's error codes, camelCase). Unknown codes fall back to the raw `detail`. Message pairs (EN / ZH examples):

| `code` | EN | zh-CN |
|---|---|---|
| `notFound` | "Not found." | "未找到该资源。" |
| `habitInactive` | "This habit is inactive and no longer accepts punches." | "该习惯已停用，不再接受打卡。" |
| `outOfWindow` | "The date is outside the habit's active window." (date-neutral — covers both the FR-3.3 today check and a rejected back-fill date) | "日期不在该习惯的有效时间窗口内。" |
| `duplicateEntry` | "One or more entries have already been recorded for this period." | "一个或多个条目在本周期内已经记录过。" |
| `duplicateName` | "This name is already used — choose a different one." | "该名称已被使用——请换一个名称。" |
| `structuralChangeBlocked` | "This field cannot be changed because punch records exist." | "已有打卡记录，无法修改该字段。" |
| … | *(full table mirrors the API doc's code list; authored into `en.json`/`zh.json`)* | |

`unknownOperandName` during create keeps the reference behavior: parse `detail` for the offending name, highlight/scroll the affected wizard criterion row; fall back to the snack-bar message if parsing fails.

## Auth & Spec Coverage (FR traceability)

FR-1.x (login, redirect-then-return, logout, silent renewal) are satisfied by knowledgebuilder's **existing** auth infrastructure against acidserver — the habits feature only needs to apply the app's existing route guard to its four routes (FR-1.2/1.3 already implemented by the app's login-redirect-return flow; FR-1.5 by the existing silent-renew mechanism; FR-1.4 by the existing logout). The reference's dedicated `CallbackComponent` and `silent-renew.html` are **not** duplicated.

| Requirement | Where implemented |
|---|---|
| FR-2.1 create (incl. atomic wizard submit) | Wizard + `POST /api/Habits` |
| FR-2.2 view list w/ progress, pre/post-window dates | `HabitListComponent` (progress comes embedded from the API) |
| FR-2.3 edit + structural locks | Wizard edit mode + `hasPunches` flags + server `structuralChangeBlocked` |
| FR-2.4 deactivate (irreversible) | List card confirm dialog + `POST …/Deactivate` |
| FR-2.5 delete | List card confirm dialog + `DELETE` |
| FR-3.1/3.3 punch w/ active-window checks | `PunchDialogComponent` (date picker + `punchDateBounds`) + `canPunchToday` button gating + server validation; past days inside the window are punchable (back-fill), future days are not |
| FR-3.2 uniqueness (`per_day`/`per_cycle`) | Server-enforced; dialog surfaces `duplicateEntry` |
| FR-3.4 history, edit/delete past punches | `HabitDetailComponent` + `PunchEditDialogComponent`; calendar-wide history entrance: `HabitCalendarComponent` |
| FR-4.1–4.4 live progress, bars, criterion views | List/detail progress blocks, `CriterionSummaryComponent`, refetch-after-mutate |
| FR-5.1–5.4 templates + Targets step | `habit-templates.ts` + wizard Steps 0–3 (labels i18n'd) |
| FR-6.1/6.2 data isolation | Server-side `OwnerId` scoping (API doc); UI sends no user identifiers |
| NFR-3/4/5 | Server concerns — see API doc; UI shows server-time dates as-is plus the timezone-difference hint from the reference (server date is authoritative) |

Out of scope (same as spec): notifications, streaks/gamification, social features, native mobile, reporting dashboards, admin UI.

## Testing & Build

- Unit tests (Vitest via `ng test --watch=false`, single spec via `--include`) as authored: `habit.service.spec.ts` (every endpoint's URL/method, `Deactivate` sub-route, history `from`/`to` query params, create-payload round-trip, and error normalization — ProblemDetails `code`/`detail`/status, `networkError` on transport failure, `httpError` fallback); `habit-templates.spec.ts` (12 FR-5.4 templates, `buildCreatePayload` shape, threshold-override-only-for-numeric/list rule, meditation=5 deviation, day-count targets within cycle length); `habit-error-messages.spec.ts` (full code→key table, unknown-code detail fallback, snack-bar panel class). Component-level dialog buffering / summary-render guards are covered by the compile-time `strictTemplates` build rather than DOM tests, matching how the reference's widget behavior was validated here. Punch-window specs: `habit-window.util.spec.ts` (pure gating/bounds, fixtures derived from the real today), `habit-list.component.spec.ts` (Punch button hidden outside `[startDate, endDate?]`, shown at both boundaries), `habit-punch-dialog.component.spec.ts` (today path sends no `punchDate`; past-day selection fetches `getHistory(D, D)`, prefills the overlay, shadows `todayValue`, sends `punchDate`, drops buffered inputs), `habit-detail.component.spec.ts` (`?date=` prefill), `habit-calendar.component.spec.ts` (window queries per navigation, fold/sort/chip-cap, failure state) — plus the backend's `Create_PunchDate_*` cases in `aclearningutil`.
- TypeScript strict + `strictTemplates`; ESLint/Prettier per repo config (note: repo-wide `ng lint` has pre-existing failures — scope lint judgments to touched files).
- `ng build` ships within knowledgebuilder under the existing `–base-href /learning/` deployment; the dev proxy/environment already targets `aclearningutil` — no new ports, no new process in `start-learning-all.ps1`.

## Known Limitations / Deviations from Reference

- No optimistic UI — mutations re-fetch (same as reference; FR-4.4 met by refresh after punch).
- Route-level OIDC configuration is the app's existing acidserver setup rather than the reference's standalone IDP; the `sub` claim the API uses is acidserver's `AspNetUsers.Id`.
- Edit-mode multi-request save sequence is not transactional client-side; partial failure leaves intermediate server state visible after re-fetch (each individual API call is transactional).
- Step 4 preview simulation remains approximate for subset scopes, cross-item composites, and `per_cycle` list properties — warning banner retained.
- All dates arrive pre-computed from the server (server local timezone); the client never re-derives cycle windows except for the default history-picker bounds.
- Punch-date picker bounds and the card/header Punch gate use the **browser-local** today; the server validates against **its** today. The dialog therefore omits `punchDate` entirely for the today path — if the client clock runs ahead, "today" punches still behave exactly like the legacy flow instead of 422ing as future-dated. A back-filled date accepted near midnight may land on a neighboring server day if the clocks disagree (same NFR-5 edge as the tz hint).
- Back-fill adds sessions/boolean writes to a PAST day, but existing records remain the only way to fix wrong values (numeric/list sessions editable via the detail history; the punch date itself is fixed at creation — delete + re-punch to re-date). No back-fill after the period ends (FR-3.3 unchanged).
- The calendar fires one `getHabitPunches` call per habit per visible period (the API has no cross-habit aggregate) — fine at personal scale, not a dashboard.
- Component styling must be expressed with the app's existing primitives; exact visual parity with the reference's Material M2 theme is not a goal — behavioral parity is.
- The `/habits` route reuses `AuthGuardService` (class-based) because every existing exercise route uses it — CLAUDE.md's functional-guard preference would be a repo-wide migration, not a habit-feature change. Likewise date pickers use the repo-standard `provideDateFnsAdapter()` (no `MatNativeDateModule`), and the wizard's step header is an Angular Material `mat-stepper` used **header-only** — no `matStepContent`; the `@switch` stays the single source of step bodies, so screens still create/destroy on transitions. `[editable]="false"` gives finished steps the done-check instead of the edit pencil, and header clicks route through `onHeaderSelect()` so `goTo()`'s forward-jump validation gates apply (the stepper is written back when a gate lands elsewhere). An earlier revision used ng-zorro `nz-steps` for this header; it was removed because its check icon depends on antd's global `.anticon` base CSS (`ng-zorro-antd/style.css`), which the app never shipped — `icon/style/index.css` is only LESS variables — so the completed-step glyph floated above the digit circles (Tailwind preflight's `svg { display: block }` made it worse). ng-zorro has been uninstalled entirely.
