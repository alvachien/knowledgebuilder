# Vocabulary Exercises Page — Code Review

Date: 2026-08-22
Scope: `src/app/pages/vocabulary-exercises/` (container, word list, 3 signal stores, 4 session/result screens, 7 dialogs, specs, styles)

Method: four parallel reviewers (container + word list / stores / session screens / dialogs), each reading full source + templates + specs and verifying claims against the actual code paths (including Material library internals and the supporting services/interfaces). The HIGH finding was independently re-verified.

**Totals: 1 HIGH · 14 MEDIUM · 11 LOW.** The dominant themes are (a) keyboard double-handling between Material controls and the `document:keyup` host listeners, (b) missing numeric validation in the options/select dialogs, and (c) state desyncs when the list screen is recreated after a session.

**Progress:** H1, M1–M14, L1–L11 fixed 2026-08-22 (see their status notes below).

---

## HIGH

### H1. ✅ FIXED (2026-08-22) — Review screen: arrow keys double-handled between the rating toggle group and the document keyup listener — double rating change + duplicate server writes

> **Status:** Fixed in `vocabulary-exercises-review-session.component.ts` — the keyup handler now ignores ArrowUp/Down/Left/Right when the event target is inside a `mat-button-toggle-group`, so the group (which already applies arrows on keydown) owns them; number keys and Escape are unaffected. Covered by 6 new tests in `vocabulary-exercises-review-session.component.spec.ts` ("arrow keys while the rating toggle group has focus": ArrowUp/ArrowDown no double rating, ArrowRight/ArrowLeft no queue navigation, number keys and Escape still work). Full suite green: 46 files / 1445 tests.

- `vocabulary-exercises-review-session.component.ts:55-101` (guard at 61-68 does not exclude buttons/toggle groups; ArrowUp/Down at 84-89), template `vocabulary-exercises-review-session.component.html:46-53`
- Verified mechanism: `MatButtonToggleGroup` handles ArrowUp/Down/Left/Right on **keydown** by synthetically clicking the neighboring toggle (`change` → `store.setRatingFromToggle` → `rateCurrent` + upsert). The same key's **keyup** then bubbles to the document `@HostListener`; the `closest()` guard only excludes input/select/overlay, so the handler calls `store.rateCurrent(currentRating ± 1)` on the *already-updated* rating.
- Scenario: user clicks rating 3 with the mouse (focus now on the toggle), presses ArrowUp once expecting 4 → keydown drops it to 2, keyup drops it again to **1**; two `upsertRating` HTTP calls fire. The group also wraps: rating 1 + ArrowUp → 5. ArrowLeft/Right while a toggle is focused change the rating *and* navigate to the previous/next word in one keystroke.
- Fix direction: add `mat-button-toggle-group` (or `button`) to the `closest()` exclusion list so the group owns keys while focused; note the group's wrap-around semantics if delegating rating arrows to it.

---

## MEDIUM

### Container + word list

**M1. ✅ FIXED (2026-08-22) — `toggleAllRows()` keeps selections of rows hidden by the filter — breaks "select all visible" and the filter↔exercise contract.**

> **Status:** Fixed in `vocabulary-exercises.component.ts` and `vocabulary-exercises-word-list.component.ts` — `isAllSelected()` now checks that every *visible* row is selected (instead of comparing counts), in both the container and the word-list child (which drives the header checkbox); `toggleAllRows()` replaces the selection with exactly the visible rows via `SelectionModel.setSelection()`, dropping hidden selections. Covered by 7 new tests: 4 in `vocabulary-exercises.component.spec.ts` ("select-all with an active filter (M1)") and 3 in `vocabulary-exercises-word-list.component.spec.ts` ("isAllSelected (header checkbox semantics, M1)"). Full suite green: 46 files / 1455 tests.

`vocabulary-exercises.component.ts:171-189` with `vocabulary-exercises-word-list.component.html:108-111`. "Select all" *adds* visible rows on top of an existing selection instead of replacing it, and `isAllSelected()` compares only counts. Scenario: select 2 rows → filter hides them → click the header checkbox → selection now contains the 2 hidden rows plus all visible ones; checkbox shows indeterminate although every visible row is selected; Review/Spelling/Worksheet/Quiz silently consume the hidden rows, violating the documented invariant (the table filter describes what the exercises use). Symmetric count-only compare can also show *checked* when N hidden rows equal N visible rows. Fix: clear before selecting visible rows, or prune the selection when `applyListFilter` runs.

**M2. ✅ FIXED (2026-08-22) — Failed rating upsert does not actually revert the toggle, despite the comment claiming it does.**

> **Status:** Fixed in `vocabulary-exercises.component.ts` — on an upsert error the handler now resets the toggle group directly via `event.source.buttonToggleGroup.value = this.getRating(item.id)` (same mechanism as the deselect path), because the unchanged `[ngModel]` binding value never triggers a `writeValue`. Stale errors (a newer click on the same item is in flight) return early without reverting. The ineffective map-recreation was removed. Covered by 3 new tests in `vocabulary-exercises.component.spec.ts` ("rating save failure (M2)"): revert to confirmed rating, revert to 0 when unrated, and the stale-error guard. Full suite green: 46 files / 1455 tests.

`vocabulary-exercises.component.ts:373-384`. The error handler recreates `contentRatingMap` with identical contents expecting the child to re-push the confirmed value, but the `[ngModel]` binding expression value never changes, so Angular skips `writeValue` and the toggle keeps showing the unsaved rating. Result: UI permanently displays a rating the server never has (visible/actual state split), until the file is reselected. Fix: re-set via `MatButtonToggleGroup` reference (as the deselect path does), or track a per-row pending state.

**M3. ✅ FIXED (2026-08-22) — Free-text filter box resets to empty when returning from a session, while the filter itself stays applied — invisible filter.**

> **Status:** Fixed in `vocabulary-exercises-word-list.component.ts` and `vocabulary-exercises.component.html` — the child gained an `appliedFreeText` input (default `''`), wired to the container's `freeText()` signal; `ngOnInit` seeds the local input-box field from it, so a screen re-created after a session restores the applied filter text instead of showing an empty box over a still-filtered table. Covered by 3 new tests: 2 in `vocabulary-exercises-word-list.component.spec.ts` ("free-text box seeding (M3)") and 1 end-to-end test in `vocabulary-exercises.component.spec.ts` ("list screen re-creation keeps the filter box in sync (M3)") that runs a full list → review → list round-trip. Full suite green: 46 files / 1459 tests.

`vocabulary-exercises-word-list.component.ts:111` + `.html:43`; container `vocabulary-exercises.component.ts:104, 262-265`. The child's `freeText = ''` initializer is not seeded from the container, whose `dataSource.filter` survives the `@switch` destroy/recreate. Scenario: filter "hello" → run Review → quit → empty filter box but table still filtered; Word/Rating dialogs opened afterwards still AND with the invisible term. Fix: pass the container's `freeText()` as an input that initializes the box.

**M4. ✅ FIXED (2026-08-22) — Re-uploading the same temp file is a silent no-op (file input value never reset).**

> **Status:** Fixed in `vocabulary-exercises.component.ts` — `onAddTempFile` now resets `inputElement.value = ''` right after capturing the picked file, so re-selecting the same (e.g. corrected) file fires a `change` event again; the captured `File` object remains valid for the async `FileReader`. Covered by 1 new test in `vocabulary-exercises.component.spec.ts` ("resets the file input so the same (e.g. corrected) file can be picked again (M4)"). Full suite green: 46 files / 1459 tests.

`vocabulary-exercises.component.ts:461-465` with `vocabulary-exercises-word-list.component.html:30-34`. `onAddTempFile` never clears `inputElement.value`, so re-picking the same file fires no `change` event. Scenario: upload → spot error → fix JSON → pick the same file → nothing happens, no feedback. Fix: reset `inputElement.value = ''` after handling.

### Stores

**M5. ✅ FIXED (2026-08-22) — Review store: late ratings-preload response can overwrite the user's in-session ratings and lose the newest confirmed save.**

> **Status:** Fixed in `vocabulary-exercises-review-session.store.ts` — the store now tracks a `userRatedItemIds` set (populated in `rateCurrent`, cleared in `reset()`); the preload's response skips those items both when filling `ratingMap` and when pre-populating queue slots, so a late server snapshot can no longer revert an in-session rating or make the confirmed save look stale to `saveRating`'s guard. Items the user has not rated are still preloaded as before. Covered by 2 new tests in `vocabulary-exercises-review-session.store.spec.ts` ("ratings preload vs in-session ratings (M5)"): the race itself (incl. `quit()` returning the confirmed 5, not the stale 2) and the untouched-items-still-preload guard. Full suite green: 46 files / 1470 tests.

`vocabulary-exercises-review-session.store.ts:94-116` (preload in `start()`) with 266-272 (stale-drop guard in `saveRating`). The preload applies server values unconditionally. Scenario: rating cache cold at session start (e.g., first load failed) → user rates word 10 as 5, upsert in flight → preload arrives with old value 2 and reverts both queue slot and `ratingMap` → the upsert confirmation is then discarded as "stale". Net: UI shows 2, server has 5, `quit()` merges 2 into the list. Fix: preload only into untouched slots (`rating === 0`), track dirty itemIds, or skip preload once any rating action occurred.

### Session screens

**M6. ✅ FIXED (2026-08-22) — Spelling screen: every keyup is forwarded unfiltered — Enter/Space on focused toolbar buttons and Escape corrupt the session.**

> **Status:** Fixed in `vocabulary-exercises-spelling-session.component.ts` — the keyup handler now bails on Ctrl/Alt/Meta chords, quits on Escape (parity with the review screen), ignores Enter and Tab outright (never word characters), and ignores Space when the target is inside a button (button activation on keydown must not also "type"); plain letters — and Space from anywhere else, since phrases contain spaces — are still forwarded even while a fab has focus. Covered by 9 new tests in the new `vocabulary-exercises-spelling-session.component.spec.ts` ("keyboard forwarding (M6)"): 6 regression tests plus guards for letter forwarding, typing after clicking a fab, and space-in-phrase. Full suite green: 46 files / 1470 tests.

`vocabulary-exercises-spelling-session.component.ts:39-42` (`this.store.handleKey(event.key)` with no target or modifier filtering). Scenarios: Tab to "Next Word" fab + Enter → button activates on keydown (next word loads), then keyup `'Enter'` reaches `handleKey` → the brand-new word is immediately marked incorrect + beep; mouse click on a button keeps focus, later Space/Enter → spurious wrong letter; Ctrl+F while next letter is `f` reveals it. Fix: bail on `ctrlKey/altKey/metaKey` and when the target is a `button` (or ignore non-character keys), or use a focused hidden input.

**M7. ✅ FIXED (2026-08-22) — Quiz screen: Enter on a focused option button answers *and* skips ahead in one keystroke.**

> **Status:** Fixed in `vocabulary-exercises-quiz-session.component.ts` — the keyup handler now bails on Ctrl/Alt/Meta chords and ignores Enter/Space when the target is inside a button (the button already activated on keydown), so Enter on an option answers without skipping past the feedback, while Enter from anywhere else still advances an answered question. Covered by 7 new tests in the new `vocabulary-exercises-quiz-session.component.spec.ts` ("keyboard forwarding (M7)"): Enter/Space-on-button guards, the modifier-chord guard (same rule as M8), and regression guards for number-key answers and Enter-advance. Full suite green: 46 files / 1484 tests.

`vocabulary-exercises-quiz-session.component.ts:41-44`; template `.html:24-33`. Tab to option A + Enter → keydown click calls `store.answer(0)`; keyup `'Enter'` hits `store.handleKey` → `next()` → the green/red feedback is never seen. Space only answers, so Enter/Space behave inconsistently. Fix: ignore activation keys when `event.target` is a button.

**M8. ✅ FIXED (2026-08-22) — Review screen: modifier keys not filtered; Alt+ArrowLeft both navigates the word and triggers browser Back.**

> **Status:** Fixed in `vocabulary-exercises-review-session.component.ts` — the keyup handler now returns early when `ctrlKey || altKey || metaKey` is set (same rule as the spelling/quiz screens), so browser/app chords no longer rate words, navigate the queue, or quit the session. Covered by 5 new tests in `vocabulary-exercises-review-session.component.spec.ts` ("modifier chords (M8)"): Alt/Ctrl arrows don't navigate, Ctrl/Alt+number doesn't rate, Ctrl+Escape doesn't quit, plain arrows still navigate. Full suite green: 46 files / 1484 tests.

`vocabulary-exercises-review-session.component.ts:70-99`. Alt+ArrowLeft calls `store.previous()` while the browser navigates away; Ctrl/Alt+1…5 also rate. The trailing `preventDefault()` (line 100) fires on keyup — too late for keydown defaults. Fix: early-return on `ctrlKey || altKey || metaKey` (as Material's `hasModifierKey` does).

**M9. ✅ FIXED (2026-08-22) — Accessibility: all nine icon-only fab buttons lack `aria-label`; tooltips do not provide an accessible name.**

> **Status:** Fixed in the three session templates — every icon-only fab now binds `[attr.aria-label]` to the same translation key as its `matTooltip`: review (enableAutoMode/previous/next/quit, 4 buttons), spelling (hint/nextWord/quit, 3 buttons), quiz (nextQuestion/quit, 2 buttons). Covered by 3 new rendered-template tests ("accessibility (M9)"), one per screen, asserting every `button[mat-fab]` exposes a non-empty `aria-label`. Full suite green: 46 files / 1484 tests.

`review-session.component.html:19-31` (auto-mode/prev/next/quit), `spelling-session.component.html:10-18` (hint/next-word/quit), `quiz-session.component.html:10-16` (next/quit). `mat-icon` is aria-hidden and `matTooltip` deliberately does not set `aria-label`, so screen readers announce unnamed buttons. Fix: bind `[attr.aria-label]` to the same translation keys used for tooltips.

### Dialogs

**M10. ✅ FIXED (2026-08-22) — All four options dialogs accept a cleared / 0 / negative `countOfItems`; OK is never disabled for it.**

> **Status:** Fixed in the four options dialogs and their templates — each gains an `isCountInvalid` getter (true unless `countOfItems` is an integer ≥ 1, so a cleared `null`, `0`, negative, or fractional value all gate) and disables OK while it holds; `onYesClick` additionally clamps the emitted count to `Math.max(1, Math.floor(count ?? 1))` as defense-in-depth for programmatic callers. Review and spelling fold it into the existing `[disabled]` binding (`isOutputDisabled || isCountInvalid`); quiz and worksheet gate solely on it. Covered by 12 new tests in `vocabulary-exercises.component.spec.ts` ("count validation (M10)" in each of the four dialog describes): `isCountInvalid` for null/0/negative/fractional vs a valid integer, the rendered OK button flipping disabled state on the count, and the clamp on confirm. Full suite green: 48 files / 1496 tests.

`reviewoptions-dialog.component.ts:40-43, 62-70`, `spellingoptions-dialog.component.ts:41-43, 63-71`, `quizoptions-dialog.component.ts:43-45, 60-67`, `worksheetoptions-dialog.component.ts:53-55, 82-93` (unlike the select dialog, which gates via `isFormInvalid`). Cleared input → `countOfItems = null` → `prepareWordQueue` slices by `null` → **empty queue** → review/spelling/quiz silently do nothing; **Worksheet has no empty guard and navigates to `/knowledge/displayv2` with zero items.** `-3` yields `slice(0, -3)` (all but the last three rows). Fix: disable OK unless count is an integer ≥ 1; clamp in `onYesClick`.

**M11. ✅ FIXED (2026-08-22) — Options dialogs overwrite the persisted count with the selection count when opened with a table selection.**

> **Status:** Fixed in all four options dialogs (`reviewoptions`, `spellingoptions`, `quizoptions`, `worksheetoptions`) — `onYesClick` now returns the *persisted* count (`currentSettings.countOfItems`, clamped to an integer ≥ 1) when `withSelection` is true, instead of the disabled input's selection-size value; the count input still displays the selection size (via `wordQueueCount`) to inform the user, and every exercise path (Review/Spelling/Quiz/Worksheet) ignores `countOfItems` when rows are selected anyway, so runtime behavior is unchanged — only the silent write-back of the selection size into the persistent setting is stopped. Covered by 7 new tests in `vocabulary-exercises.component.spec.ts` (one "returns the persisted count, not the selection count, on confirm (M11)" test per dialog — review, spelling, quiz, worksheet — plus the worksheet's "still displays the selection count in the disabled count input" guard). Full suite green: 48 files / 1504 tests.

`reviewoptions-dialog.component.ts:40-42`, `spellingoptions-dialog.component.ts:41-43`, `quizoptions-dialog.component.ts:43-45`, `worksheetoptions-dialog.component.ts:53-55`; container write-back at `vocabulary-exercises.component.ts:597, 717, 772, 845`. With `withSelection` the Count input is disabled and seeded with `wordQueueCount`, but `onYesClick` still returns it and the container stores it into the persistent setting. Scenario: configured 50, select 3 rows, OK → stored count silently becomes 3; later, no selection → 3 random words instead of 50. Fix: omit/flag the count in the result when `withSelection`.

**M12. ✅ FIXED (2026-08-22) — Worksheet dialog breaks the `currentSettings` round-trip for `subTitle`.**

> **Status:** Fixed in `vocabulary-exercises-worksheetoptions-dialog.component.ts` — `subTitle` now seeds from `currentSettings?.subTitle ?? this.data.title ?? ''`, so a saved custom subtitle round-trips on reopen instead of being silently replaced by the file name; the file name remains the fallback when no subtitle was ever saved, preserving the original default. Covered by 2 new tests in `vocabulary-exercises.component.spec.ts`: "seeds subTitle from currentSettings, not the file name (M12)" (selection branch, custom subtitle wins) and "should initialize with defaults and seed subTitle from the file name (M12 fallback)" (no-selection branch, file-name fallback). Full suite green: 48 files / 1504 tests.

`vocabulary-exercises-worksheetoptions-dialog.component.ts:57`. `subTitle` is seeded from `this.data.title ?? ''` (file name) and never reads `currentSettings.subTitle`, while every other field round-trips. Scenario: custom subtitle "Unit 5 Test" saved → reopen dialog shows the file name → OK silently replaces the custom subtitle. Fix: seed with `currentSettings?.subTitle ?? this.data.title ?? ''`.

**M13. ✅ FIXED (2026-08-22) — Select dialog "By Count": offset (and count) unbounded and fractional; out-of-range offset silently wipes the table selection.**

> **Status:** Fixed in `vocabulary-exercises-select-dialog.component.ts` and `vocabulary-exercises.component.ts` — the container now passes `rowCount` (the visible row count) into the dialog data; `isFormInvalid` for By Count requires an integer count ≥ 1 *and* an integer offset in `[0, rowCount)`, so a cleared/0/negative/fractional count or an out-of-range/fractional offset disables OK; `onYesClick` additionally clamps count to `≥ 1` and offset to `[0, rowCount-1]` as defense-in-depth for programmatic callers. Covered by 4 new tests in `vocabulary-exercises.component.spec.ts` ("By Count validation (M13)"): fractional/zero/negative count flagged, negative/fractional/out-of-range offset flagged (with `0` and `rowCount-1` accepted), the rendered OK button flipping on an out-of-range offset, and the count/offset clamp on confirm. Full suite green: 48 files / 1514 tests.

`vocabulary-exercises-select-dialog.component.ts:63-74, 76-91`; consequence in container `vocabulary-exercises.component.ts:928-939, 965-972`. Validation only checks `count > 0` / `offset >= 0`; the dialog receives no row count so it cannot bound the offset; `min` attributes don't constrain ngModel. Scenario: offset 10000 on a 200-row file (or 0.5) → `applyCountSelection` clears the selection, selects nothing → the user's previous selection is gone with zero feedback, and the next exercise silently falls back to the whole visible file. Fix: pass visible row count into dialog data; require integer count ≥ 1 and `offset < rowCount`, disabling OK otherwise.

**M14. ✅ FIXED (2026-08-22) — Select dialog "By Word": newline-separated input unsupported; no-match input silently clears the selection.**

> **Status:** Fixed in `vocabulary-exercises-select-dialog.component.ts` and `vocabulary-exercises.component.ts` — both the dialog and the container now split on commas *and* newlines (`/[\n\r,]+/`) and trim each token (whitespace is trimmed around tokens, not split on, so multi-word entries like "apple pie" survive); the dialog receives `visibleWords` and `isFormInvalid` for By Word rejects empty/separator-only input *and* input where no token matches a visible word, so a no-match paste can no longer enable OK; the container's By Word path only clears the existing selection when at least one token matches, so a no-match paste (or a programmatic caller) can no longer silently wipe it. `onYesClick` returns a clean comma-joined token list regardless of the original separators. Covered by 6 new tests: 4 in the select-dialog describe ("By Word validation (M14)" — separator-only `",,,"` rejected, no-match rejected, newline-separated with a match accepted, multi-word "apple pie" preserved) plus 2 container tests in "onSelect (By Word)" (newline-separated input matches; a no-match paste leaves a pre-existing 2-row selection intact). Full suite green: 48 files / 1514 tests.

`vocabulary-exercises-select-dialog.component.ts:69-70, 86-88`; parsing at `vocabulary-exercises.component.ts:981-995`. The container splits on `','` only and exact-matches visible `enword`s, but the `rows="5"` textarea invites newline-separated pastes; the container unconditionally clears the selection first. Scenario: paste `apple\nbanana\ncherry` (or type `",,,"`) → OK enabled (non-empty) → nothing matches → selection cleared and nothing selected → next exercise silently falls back to the whole file. Fix: normalize separators (newlines/whitespace → commas) and validate at least one matching token.

---

## LOW

### Container + word list

**L1. ✅ FIXED (2026-08-22) — Selection count displays 0 after returning to the list with a live selection.**

> **Status:** Fixed in `vocabulary-exercises-word-list.component.ts` — `ngOnInit` now seeds `selectionCount` from `selection().selected.length` before subscribing to `selection.changed`, so a screen re-created after a session (the container's `@switch` destroys/recreates this child while the shared SelectionModel keeps its checked rows) shows the right count immediately instead of 0 until the next change. Covered by 2 new tests in `vocabulary-exercises-word-list.component.spec.ts` ("selectionCount seeding (L1)": seeds from a pre-selected model, and still mirrors later changes). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises-word-list.component.ts:167-185`. `selectionCount` is only updated by the `selection.changed` subscription, never seeded on init — after a session, the toolbar shows 0 while checkboxes are visibly checked and exercises still act on the selection. Fix: seed in `ngOnInit` with `selection().selected.length`.

**L2. ✅ FIXED (2026-08-22) — Rating toggles are interactive for temporary files and latch phantom values.**

> **Status:** Fixed in `vocabulary-exercises-word-list.component.html` and `.component.ts` — the word-list gained a `ratingsEnabled` input (default `true`) bound by the container to `studyContentId > 0`; when false (temp content with a non-positive id) every `mat-button-toggle` in the rating column is `[disabled]`. Disabling the toggles (not the group) is deliberate: `mat-button-toggle-group`'s `[disabled]` is overridden by the `[ngModel]` form control's `setDisabledState`, so the inner buttons stayed interactive when the group was disabled. Covered by 2 new rendered tests in `vocabulary-exercises-word-list.component.spec.ts` ("rating toggle disabling for temp content (L2)"): toggles enabled for persisted content, disabled (inner buttons `disabled`) for temp content. Full suite green: 48 files / 1529 tests.

`vocabulary-exercises-word-list.component.html:133-145`; guard at `vocabulary-exercises.component.ts:343-352`. For temp content (negative id) the container refuses the rating call, but the toggle group is not disabled and the `[ngModel]` value never changes to trigger a reset (same `writeValue`-skip mechanism as M2) — the table shows a rating that doesn't exist, while sort-by-rating uses 0. Fix: `[disabled]` for non-positive `studyContentId`.

**L3. ✅ FIXED (2026-08-22) — Content-load error leaves the previous file's rows bound to the new file's `studyContentId`.** *(highest-impact LOW: latent server-side data corruption)*

> **Status:** Fixed in `vocabulary-exercises.component.ts` — the content GET error handler now drops the previous file's rows (`dataSource.data = []`), resets `studyContentId` to 0, clears `contentRatingMap` and `pendingContentRatings`, and bumps `fileLoadToken` so the in-flight ratings load for the failed file is also discarded (its late response is dropped by the token guard). The previous file's rows can no longer be shown (and rated) under the new file's content id. Covered by 1 new test in `vocabulary-exercises.component.spec.ts` ("should clear the previous file rows and studyContentId when the new content load errors (L3)"). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises.component.ts:403-405, 410-424` (error handler 421-423). Scenario: file A loaded → select B → content GET fails → table still shows A's words, `contentRatingMap` fills with B's ratings (misaligned by item id), and clicking a rating toggle upserts A's item ids against B's content id — persisting ratings into the wrong file. Fix: on content-load error, clear `dataSource.data` / `studyContentId` / ratings, or revert `selectedFile`.

**L4. ✅ FIXED (2026-08-22) — Switching back to a cached file filters the new rows against the previous file's ratings.**

> **Status:** Fixed in `vocabulary-exercises.component.ts` — `contentRatingMap` is now cleared **before** the content GET subscribe (so a synchronously-resolving cached load re-filters the new rows against an empty map, not the previous file's ratings), and the ratings GET error path reassigns `dataSource.filter` too, so a ratings failure no longer leaves the rows filtered by stale ratings until the next change. Covered by 1 new test in `vocabulary-exercises.component.spec.ts` ("should not filter a cached file new rows against the previous file ratings (L4)") that loads file A under a `rating ≥ 5` filter, then switches to a cached file B whose ratings GET errors, asserting B's colliding-id row does not inherit A's rating. Full suite green: 48 files / 1529 tests.

`vocabulary-exercises.component.ts:407-427`. The content subscription is set up before `contentRatingMap.set(new Map())`; cached content resolves synchronously, so the rating-aware predicate runs with the old file's ratings until the new ratings response reassigns `dataSource.filter` (and never, if the ratings GET errors). Fix: clear `contentRatingMap` before subscribing; reassign the filter in the ratings error path too.

**L5. ✅ FIXED (2026-08-22) — `FileReader.onload` has no destroyed-component guard.**

> **Status:** Fixed in `vocabulary-exercises.component.ts` — the container tracks an `isDestroyed` flag set in `destroyRef.onDestroy`, and `reader.onload` bails at the top when it is set, so navigating away mid-read no longer writes the destroyed component's signals/`allFiles` or registers temp content in the service cache. (The fix exposed a pre-existing test smell — the describe-scoped `createdReaders` array accumulated across tests, so `createdReaders[0]` was a stale previous-test reader whose handler closed over a now-destroyed component; the array is now cleared per test.) Covered by 1 new test in `vocabulary-exercises.component.spec.ts` ("does not mutate state if the component is destroyed mid-read (L5)"). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises.component.ts:461-556`. Navigating away mid-read still runs the callback, writing signals/`allFiles` of a destroyed component and registering temp content in the service cache. Harmless today, latent break later. Fix: `destroyRef.onDestroy` flag checked at the top of the handler.

### Stores

**L6. ✅ FIXED (2026-08-22) — Spelling store: `nextWord()` after completion flips the last word's result from correct to incorrect.**

> **Status:** Fixed in `vocabulary-exercises-spelling-session.store.ts` — `nextWord()` now returns early when `isComplete()` or `queueIndex() === -1`, so a stray give-up click in the gap before the container's mode switch destroys the screen cannot call `markCurrentIncorrect()` on the last (correct) word and corrupt the tally. (`handleKey`/`hint` were already safe post-completion via their `letterIndex`/`letters.length` guards.) Covered by 1 new test in `vocabulary-exercises-spelling-session.store.spec.ts` ("does not flip the last (correct) result to incorrect after completion (L6)"). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises-spelling-session.store.ts:128-131, 133-136, 151-160`. On completion, `queueIndex` stays at `len-1`; in the gap before the container's mode switch destroys the screen, a click on the give-up FAB marks the last (correct) word incorrect and corrupts the tally. Fix: guard on `isComplete()`/`queueIndex === -1`, or set `queueIndex` to `-1` in the completion branch.

**L7. ✅ FIXED (2026-08-22) — Spelling and quiz stores: `progress` never reaches 100% and shows 0% for single-item sessions.**

> **Status:** Fixed in both session stores — spelling `progress` now counts **completed** queue items (`queue.filter(q => q.completed)`) and rounds, reaching 100% on completion; quiz `progress` now counts **answered** questions via a new `answeredCount` signal (incremented in `answer()`, reset in `start`/`reset`), reaching 100% when the last question is answered. Both replace the position-based `currentIndex * 100 / length` that capped at `(n-1)/n` and read 0% for single-item sessions. Covered by 5 new tests: 2 in `vocabulary-exercises-spelling-session.store.spec.ts` (reaches 100% on completion and is rounded; single-word session 0%→100%) and 3 in `vocabulary-exercises-quiz-session.store.spec.ts` ("progress (L7)": rises as questions are answered, reaches 100% on the last answer, single-question 0%→100%). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises-spelling-session.store.ts:39-41`; `vocabulary-exercises-quiz-session.store.ts:31-35`. Position-based `currentIndex * 100 / length` (vs the review store's rounded `(cursor + 1) / length`): a one-word session shows 0% throughout; multi-item sessions cap at `(n-1)/n`; values unrounded. Fix: measure completed items and round.

**L8. ✅ FIXED (2026-08-22) — Review store: destroy cancels the auto-mode timer but not in-flight rating subscriptions.**

> **Status:** Fixed in `vocabulary-exercises-review-session.store.ts` — the `destroyRef.onDestroy` callback now unsubscribes every entry in `ratingSubscriptions` (and clears the array) in addition to stopping the auto-mode timer, mirroring `reset()`/`quit()`, so navigating away mid-save/load can no longer leave a rating subscription alive until its (possibly stale) response lands. Covered by 2 new tests in `vocabulary-exercises-review-session.store.spec.ts` ("destruction": cancels in-flight rating saves on destroy; cancels an in-flight ratings load on destroy so a late response cannot leak). Full suite green: 48 files / 1529 tests.

`vocabulary-exercises-review-session.store.ts:70-75` vs `121-134`. Subscriptions are unsubscribed only in `reset()`/`quit()`; navigating away mid-save leaves them alive until completion (benign, but inconsistent with the stated rationale). Fix: unsubscribe in the destroy callback too.

### Session screens

**L9. ✅ FIXED (2026-08-22) — Color-only / sound-only state feedback; no live announcements.**

> **Status:** Fixed in both session screens and stores. Quiz: the option buttons now carry a `check_circle`/`cancel` `mat-icon` (aria-hidden) beside the green/red color cue, and a `role="status" aria-live="polite"` region announces `vocabularyExercises.correct`/`incorrect` after answering; the `[disabled]` binding was removed from answered options (re-answering is already guarded by `store.answer()`'s `isAnswered` check), so focus is no longer dropped to `<body>` after a pick. Spelling: a `role="status" aria-live="polite"` region announces `vocabularyExercises.incorrect` once the current word's result flips to incorrect (driven by a new `currentResultCorrect` computed), so a wrong keypress is no longer signaled by `beep.wav` alone. A new `incorrect` i18n key was added (en + zh-CN). Covered by 10 new tests: 2 in `vocabulary-exercises-quiz-session.store.spec.ts` ("isCorrect (L9)"), 5 in `vocabulary-exercises-quiz-session.component.spec.ts` ("live announcements + focus (L9)"), 1 in `vocabulary-exercises-spelling-session.store.spec.ts` ("currentResultCorrect (L9)"), and 2 in `vocabulary-exercises-spelling-session.component.spec.ts` ("live announcements (L9)"). Full suite green: 48 files / 1548 tests.

`quiz-session.component.html:26-29` + `.scss:71-79` (correct vs wrong only via green/red); spelling wrong key → only `beep.wav`. No `aria-live` region on either screen; after answering a quiz question the focused option becomes `disabled`, dropping keyboard focus to `<body>`. Fix: add icon/`aria-live` summary; keep answered buttons focusable or move focus.

**L10. ✅ FIXED (2026-08-22) — `event.preventDefault()` on keyup in the review handler cannot stop keydown-triggered defaults.**

> **Status:** Fixed in `vocabulary-exercises-review-session.component.ts` — added a `document:keydown` host listener (`handleKeyDownEvent`) that calls `preventDefault()` for the arrow keys (scroll suppression) when the target is a plain element (not inside a form control, the toggle group, a button, or an overlay panel, and no modifier chord) — the same guard surface as the keyup handler. State changes stay on keyup (single source of truth); the new listener only blocks the browser's keydown scroll, which the keyup `preventDefault` was too late to stop. The toggle group / `mat-select` / button keydown behavior is untouched (they are excluded from the guard). Covered by 7 new tests in `vocabulary-exercises-review-session.component.spec.ts` ("scroll suppression on keydown (L10)"): arrows preventDefault'd from a plain target, non-arrow keys left alone, arrows left alone inside the seconds-per-word select / toggle group / a button, modifier+arrow chords pass through, and a regression guard that keyup navigation still works after the keydown guard runs. Full suite green: 48 files / 1548 tests.

`vocabulary-exercises-review-session.component.ts:100`. With focus on the body, ArrowUp/Down still scroll the page during review. Fix: handle on `document:keydown` if suppressing scroll matters.

### Dialogs

**L11. ✅ FIXED (2026-08-22) — Worksheet dialog carries dead datepicker/radio machinery.**

> **Status:** Fixed in `vocabulary-exercises-worksheetoptions-dialog.component.ts` and `interfaces/vocabulary.ts` — removed the `provideDateFnsAdapter()` / `MAT_DATE_FORMATS` / `MAT_DATE_LOCALE: zhCN` providers, the `MatDatepickerModule` / `MatDateFnsModule` / `MatRadioModule` imports, the `MY_DATE_FORMATS` / `getAllPrintExecDateString` / `zhCN` / `date-fns/locale` imports, and the `allPrintExecDates` computed the template never rendered; also removed the orphaned `printExecDate?: boolean` field from `VocabularyWorksheetOption` (declared but never read or written by any vocabulary code — the worksheet builds a `KnowledgeExercisePrintOption`, which has no such field). The dialog's lazy chunk no longer bundles the date adapter/radio machinery, and the canonical `MY_DATE_FORMATS` / `getAllPrintExecDateString` exports remain for the other (chinese/formula/translate) dialogs that still use them. Covered by 2 new tests in `vocabulary-exercises.component.spec.ts` ("dead machinery removal (L11)"): no `mat-datepicker`/`mat-radio-group` renders, and the component carries no `allPrintExecDates` and emits no `printExecDate` on confirm. Full suite green: 48 files / 1548 tests.

`vocabulary-exercises-worksheetoptions-dialog.component.ts:5-6, 16-17, 19, 36-38, 41-45, 66`. `provideDateFnsAdapter()`, `MAT_DATE_FORMATS`, `MAT_DATE_LOCALE: zhCN`, `MatDatepickerModule`, an unused `MatRadioModule`, and an `allPrintExecDates` computed the template never renders — dead weight bundled into the lazy chunk, with hardcoded English labels bypassing i18n. Fix: remove unused providers/imports/computed (and the orphaned `printExecDate` field if unused).

---

## Verified clean (checked, no action needed)

- **Subscription hygiene**: every container subscription (content lists, file content, ratings, all `afterClosed()`, upserts) and the word-list's `selection.changed` use `takeUntilDestroyed(destroyRef)`; constructor `effect()`s auto-destroy. No leaks.
- **File-switch races**: the `fileLoadToken` scheme correctly drops superseded content/ratings responses (including temp uploads); `pendingContentRatings` discards stale/out-of-order upsert responses.
- **Review store auto-mode interval**: single subscription guaranteed (`enableAutoMode` guarded, `setAutoModeSeconds` unsubscribes first, all exits route through `stopAutoMode()`, self-stop on last word, destroy kills the timer). No concurrent-interval or post-unmount firing path.
- **`quit()` rating semantics**: `ratingMap` written only from server responses → confirmed ratings only, keyed consistently with the container's `contentRatingMap`.
- **Quiz store**: re-answers and out-of-range picks rejected; tallies consistent; all post-completion paths no-op correctly. — now covered: the "post-completion no-ops" describe asserts `answer`/`next`/`handleKey` are all no-ops once `isComplete()` is true (no extra sound, no tally change, no cursor drift); re-answers/out-of-range covered by the existing "ignores out-of-range picks and re-answers" test.
- **Boundaries**: empty-queue `start()` no-ops in all three stores; no off-by-one errors found in cursor/index logic.
- **Signal hygiene**: computeds pure, no effect write-backs, no out-of-context mutations.
- **Filter dialogs**: both clone seeds (`data.map(c => ({...c}))`); Cancel/backdrop/Esc never leak edits; all i18n keys exist in en + zh-CN.
- **Result screens**: no division-by-zero paths (result modes only entered with non-empty queues); templates null-safe on empty state; `@for track` expressions valid. — now covered: `vocabulary-exercises-quiz-result.component.spec.ts` and `vocabulary-exercises-spelling-result.component.spec.ts` render each screen against a populated session (score line + one `mat-checkbox` per result row) and an empty session (no throw, score `0 / 0`, no rows), plus `backToList` emit.
- **SCSS convention**: no `.mat-column-*` overrides in component files — column widths correctly live in `_shared-tables.scss`.
- Minor nit: `matNativeControl` on `<mat-select>` in the word-list template (line 10) does nothing there (directive only matches native input/textarea/select) — cleanup only.

## Notable spec gaps

1. Review store: the preload-vs-user-rating race (M5) is now covered by the "ratings preload vs in-session ratings" tests; still untested: `quit()` while a save is in flight.
2. ~~Spelling store: no post-completion tests (`handleKey`/`hint` no-ops, `nextWord()` must not flip the last result — L6).~~ — now covered: `nextWord()` post-completion is guarded by the L6 test. `handleKey`/`hint` were already safe via their `letterIndex`/`letters.length` guards (still untested directly).
3. ~~Quiz store: no post-completion guard tests~~ — now covered: the "post-completion no-ops" describe asserts `answer`/`next`/`handleKey` are no-ops after `isComplete()`. Still untested: a double `start()` (start while a session is active).
4. ~~Quiz/spelling session components had no spec coverage of their keyboard forwarding~~ — now covered: both have their own specs (M6, M7).
5. ~~Options dialogs: specs assert selection-count seeding but never assert the write-back of the pinned value (M11).~~ — now covered: each of the four options dialogs has an "returns the persisted count, not the selection count, on confirm (M11)" test (review/spelling/quiz/worksheet), and the worksheet dialog's `subTitle` round-trip (M12) is covered by both a custom-subtitle-wins test and a file-name-fallback test.
6. Container: no coverage of the re-creation-after-session path behind L1 (M2's error-revert path and M3's filter-box re-creation path are now covered directly by their tests).
