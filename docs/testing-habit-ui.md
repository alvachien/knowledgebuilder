# Testing Guide — Habit UI (`knowledgebuilder`)

Client-side companion to [`../../aclearningutil/docs/testing.md`](../../aclearningutil/docs/testing.md).
The API owns verdict **computation** (cycle windows, criterion DAG, day counts);
the UI owns verdict **presentation**. These tests feed each RC scenario's exact
server-computed payload into the real components and assert what the user sees.

Reference: [`design-habit-ui.md`](design-habit-ui.md); functional spec real
cases RC-1 … RC-16 (RC-3 **retired** — superseded by RC-5 + RC-9, see spec
§ RC-3 (superseded)).

## 1. Test Setup

### Running the tests

```bash
ng test --watch=false --include="**/habit-rc-scenarios.spec.ts"   # the RC rendering suite
ng test --watch=false --include="**/habit-user-journeys.spec.ts"  # the interactive journeys
ng test --watch=false --include="**/habit-*.spec.ts"              # all habit specs (the glob must match spec files; `**/habits/**` pulls .html/.scss in as test entries)
ng test                                                          # everything
```

Never `npx vitest` directly — it bypasses the Angular Vite plugin and breaks
`templateUrl` resolution (repo standard).

### Scenarios vs providers — who computes what

Every verdict number in these tests is **server data the API suite already
proves correct** (the tables in API testing.md § 2). The UI never recomputes a
window or an aggregate (design-habit-ui.md § Known Limitations), so a failing
scenario here means a rendering bug, not a verdict bug.

### Fixed-payload convention

No test depends on the machine clock. "Today" enters each scenario only
through the `progress` payload the components render as-is; the only
clock-sensitive surface (`serverTodayDiffers`) is deliberately not asserted
here. Harness notes (`habit-rc-scenarios.spec.ts`):

- **`createList(habits)`** — full DOM render of `HabitListComponent` with a
  stubbed `HabitService` (`getHabits: of(habits)`), `Router`/`ActivatedRoute`
  stubs RouterLink needs (`createUrlTree`/`serializeUrl`), and the repo-standard
  key-echoing Transloco stub (so DOM text asserts on `habits.*` keys). Card
  helpers: `label` (progress text), `today` (day-count today line), `hasChip`
  (pass badge), `window` (cycle range), plus `comp.progressPercent(habit)` for
  bar percentages.
- **`createDetail(habit, items, history)`** — component-level `HabitDetailComponent`
  (no template render; constructor loads settle in one macrotask), asserting
  `showChipFor` / `chipLabel` / `valueText` / `itemOf` and the history-query
  URL the default picker sends.
- Builders `cum(...)` / `dayCount(...)` / `habitOf(...)` mirror the API DTOs
  one-for-one.

## 2. RC → UI scenario map

Suite: `src/app/pages/habits/habit-rc-scenarios.spec.ts` (19 tests). Each RC
asserts **both** directions where the UI distinguishes them.

| RC | Habit shape | UI assertion (fail → success) |
|---|---|---|
| RC-1 | weekly numeric cumulative | card label `5 / 10`, bar 50 %, no chip → `10 / 10`, 100 %, pass chip; window text `09-21 → 09-27` vs `09-28 → 10-04` |
| RC-2 | monthly numeric cumulative | 305 / 300 chip + bar clamped to 100 % → October window restarts: `60 / 300`, 20 %, no chip (calendar reset is server-side, UI just re-renders) |
| RC-4 | daily numeric day-count (base_rate) | `0 / 1 days` + today `23 / 50` no chip → `1 / 1` + `76 / 50` chip |
| RC-5 | weekly `per_day` list cumulative | `8 / 10` no chip → `10 / 10` chip |
| RC-5b | `per_cycle` rejection | punch attempt rejected → snack-bar carries the mapped `habits.errors.duplicateEntry` message (dialog-side buffering/restore: existing `habit-punch-dialog.component.spec.ts`) |
| RC-6 | daily boolean checklist | today `2 / 4` no chip → `4 / 4` chip; per-session history rows render `✓`/`✗` |
| RC-7 | multi-item boolean count, weekly vs whole | Book1 weekly `2 / 4` every window fails → whole `4 / 4` passes with the span window `09-21 → 10-05` |
| RC-8 | whole numeric sum | `61 / 60` chip, bar caps at 100 % → `45 / 60`, 75 %, no chip |
| RC-9 | whole list distinct count | `9 / 9` chip → `8 / 9` no chip; history list row joins entries (`Ex 1, Ex 2`) |
| RC-10 | composite AND root | root `2 / 2` chip **and** `app-habit-criterion-summary` rendered (operands visible) → `1 / 2` no chip |
| RC-11 | weekly boolean day-count | `5 / 5 days` + today `1 / 1` chip → `4 / 5` no chip; `currentDayValue: null` (out of active window) suppresses the today line |
| RC-12 | weekly numeric, end_date mid-cycle | default history range clamps to the truncated cycle (`09-15 → 09-17`, `cycleTo` never crosses `endDate`); cumulative "cycle complete" chip on the **earliest** passing day only |
| RC-13 | subset-scoped boolean count | appendix punches excluded server-side → card shows `2 / 3` no chip → `3 / 3` chip; the out-of-scope session still names its item (`Appendix A`, `#id` for removed items) |
| RC-14 | NOT composite root | caffeine-free day `1 / 1` chip → punched day `0 / 1` no chip |
| RC-15 | weekly running, deactivated | state badge flips to `stateInactive` (+ `.inactive` class), **punch button gone**, last verdict (`10 / 10` + chip) stays visible; punch attempts on inactive/expired habits surface `habitInactive` / `outOfWindow` |
| RC-16 | mixed base_rate numeric | history sessions show the **raw** session value (`20`, not `20 × 1.5`); weighting lives in the totals (server) — the `todayValueDelta` client mirror is covered in `habit-punch-dialog.component.spec.ts` (L8d) |

### What already lives elsewhere (not duplicated here)

The component specs authored with the feature own the interaction machinery;
the RC suite reuses their payload shapes rather than re-testing them:

| Concern | Owner spec |
|---|---|
| Preview simulation (Step 4) mirrors window anchoring + DAG | `habit-simulation.spec.ts` |
| Template table incl. `book_*` whole-cycle defaults and the meditation 21→5 deviation; `nameKey` well-formedness, `resolveTemplate` (key-echo ⇒ English fallback, localized recomposition), and en/zh i18n completeness + EN-drift (fs read of the JSON files) | `habit-templates.spec.ts` |
| Reading-style create coverage for ALL 12 templates (default walk + exact items payload, targets override, item/property rename) and seed-time localized names | `habit-wizard.component.spec.ts` (parametrized + localized describes) |
| Wizard validation mirroring the API rule table (targets, DAG cycles, operand counts) | `habit-wizard-validation.spec.ts` |
| Edit-mode FR-2.3 locks (`hasPunches` cycle select, save choreography, root switch) | `habit-wizard.component.spec.ts` |
| Punch dialog optimistic upsert + base-rate day delta + partial-batch retry | `habit-punch-dialog.component.spec.ts` |
| Punch edit (FR-3.4 prefill, per_cycle hint) | `habit-punch-edit-dialog.component.spec.ts` |
| Composite operator chips via i18n (`habits.operator.*`) | `habit-criterion-summary.component.spec.ts` |
| History filter race/`invalidDateRange` guard, default window | `habit-detail.component.spec.ts` |
| HTTP URLs + ProblemDetails error normalization | `habit.service.spec.ts` |
| Error-code → key table incl. `duplicateEntry`, `habitInactive` | `habit-error-messages.spec.ts` |

### Interactive journeys

Suite: `src/app/pages/habits/habit-user-journeys.spec.ts` (3 tests). Where the
table above pins *rendering* with pre-fabricated payloads, this suite drives the
app the way a user does — DOM clicks and typed input only, never component
method calls — over a stateful in-memory fake service that computes verdicts the
way the API does (numeric × base_rate, list entry counts, boolean day counting,
cumulative pass, day-count tally). Each journey runs the full loop
**create → punch → verify the rendered output**:

| Journey | Path | Verified |
|---|---|---|
| RC-1 | click `running` template card → Next ×4 → Create → punch dialog (real `MatDialog`) → type 12 → submit → close → card shows `12 / 30` no chip → punch 18 → `30 / 30` + chip → card menu → Deactivate → confirm dialog → inactive badge, punch button gone, verdict still visible | create payload shape (name-based refs, cumulative targets) + navigation, buffered numeric punch flow, live refresh after `'saved'` (FR-4.4), RC-15 |
| RC-5 | `vocabulary` template → textarea entries (split on newlines) | buffered list punch, `per_day` payload sent, 8/10 fail → 10/10 pass |
| RC-11 / RC-6 | `morning_exercise` template → checkbox tick (auto-submit, no footer click) | boolean immediate punch, day-count labels `1 / 5 days` + today `1 / 1`, no chip |

Harness notes:
- Real `MatDialog`/`MatMenu` overlays + `provideNoopAnimations()`; the dialog
  and menu live in the `OverlayContainer`, so interaction helpers tick the
  `ApplicationRef` (overlay views are attached to the app, not to the fixture).
- Buttons embed `mat-icon` ligatures in their text (`arrow_forward
  habits.wizard.next`) — match by substring, not equality.
- Typed input goes through `ngModel`: set `input.value`, dispatch an `input`
  event, then `appRef.tick()` so the buffered-submit button's `[disabled]`
  binding refreshes before clicking it.

### Adding a scenario

1. Build the server payload with `cum` / `dayCount` + `habitOf` — copy the
   numbers straight from the API test table for that RC.
2. List-level rendering → `createList([...])` and the `label/today/hasChip/window`
   helpers; history/session logic → `createDetail` methods.
3. Assert **both** verdict directions in the same `it` unless the payloads
   interfere.
4. If an RC changes what the *server* computes, update the API suite first —
   this suite should only ever need the new numbers.

## 3. Conventions

- Run the touched spec via `ng test --include` first, then the habit glob.
- `ng lint` is failing repo-wide on pre-existing spec debt — scope lint
  judgments to touched files.
- Signals harness: list tests call `fixture.detectChanges()` before/after the
  one `flush()` (constructor load is synchronous through the stub); detail
  tests never render the template (component methods + signals only).
