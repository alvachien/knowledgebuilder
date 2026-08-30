# Knowledge Exercises & Chinese Exercises Pages — Logic Review

- **Date:** 2026-08-29
- **Branch:** `feat/rating-unrated-semantics`
- **Scope:** `src/app/pages/knowledge-exercises/**`, `src/app/pages/chinese-exercises/**`, and the
  filter pipeline they share (`src/app/interfaces/knowledge-list-filter.ts`, `learnchinese.ts`,
  `ui-common.ts` `matchRating`, `vocabulary.ts` `RatingCondition`).
- **Method:** manual read of containers, list children, dialogs, converters; verified against the
  installed `@angular/material` 21 source and real content data
  (`knowledgebuilder-content/learnchinese/`); focused tests run via `ng test` (158 tests, 5 spec
  files, all passing at review time).
- **Re-verified:** 2026-08-29, after the knowledge filter-UI merge (Content/Rating dialogs → one
  field-selecting filter dialog; filter fields aligned to table columns). Findings and line refs
  refreshed against the current tree; full suite green (1808 tests / 75 spec files) and the
  production build passes.
- **Status legend:** each finding carries a status (`open` / `fixed` / `wontfix`) for tracing.

---

## Findings (real issues)

### 1. [Chinese] Recite flow is a dead end — status: open

- **Where:** `chinese-exercises.component.ts:590` (`onStart() {}`)
- **What:** Exercises ▾ → Recite opens `ChineseExercisesOptionsDialogComponent`, collects
  level/count/allowEmptyAnswer, then calls `onStart()` — an empty stub. Nothing happens.
  `this.setting` (`ChineseReciteOption`) is write-only state.
- **Origin:** pre-existing on `main` (the recite screen was removed earlier); the menu item and
  dialog survived it.
- **Suggestion:** remove the Recite menu item + options dialog + `setting`, or rewire the flow to
  an actual target.

### 2. [Chinese] Print options collected but silently ignored — status: open

- **Where:** `chinese-exercises.component.ts:613-619` (copying dialog results) vs
  `chinese-exercises.component.ts:658-667` (`onPrint` building `execPrintSetting`).
- **What:** `onPrintWithOptions` stores `respectRetentionCurve`, `printExecDate`, `execDate`,
  `printEntryDate` into `printSetting`, but `onPrint` builds a fresh `execPrintSetting` that
  hardcodes `printEntryDate: true` and never reads the other three —
  `KnowledgeExercisePrintOption` (`questionbank-base.ts:1374`) has no such fields. The dialog's
  exec-date radio ("respect retention curve") has no effect.
- **Origin:** pre-existing on `main`.
- **Contrast:** the knowledge print dialog is fine — every option flows through
  `this.printSetting` into `uiService.setSelectedExerciseItem`.
- **Suggestion:** either extend `KnowledgeExercisePrintOption` and implement the retention/exec-date
  behavior in the display/print renderer, or drop the dead controls from
  `chinese-exercises-printoptions-dialog.html`.

### 3. [Chinese] v2 multi-segment items print as "undefined" — status: open

- **Where:** `learnchinese.ts:277-278` (`convertChineseReciteItemToKnowledge`, FillInTheBlank
  branch): `qitem.question += item.content`.
- **What:** multi-segment items (`contentlength > 0`, no `content` field) produce
  `question = "<subject>, <author>. undefined"` and no answers. The Dictation branch loops
  content1..content39; the FillInTheBlank branch does not.
- **Data evidence:** 10 items in `knowledgebuilder-content/learnchinese/gaozhongchangshi.json`
  (a version-2 file) have `contentlength` and no `content`; printing that file without a narrow
  selection includes them.
- **Origin:** pre-existing (the converter is unchanged on this branch), data-verified during this
  review.
- **Suggestion:** in the FillInTheBlank branch, fall back to the joined segments (same logic as
  `getChineseReciteItemDisplayContent`) when `content` is absent.

### 4. [Chinese] Filter cannot see multi-segment content — status: open

- **Where:** `learnchinese.ts:90-91` (`chineseConditionFieldText`, `content` case) and
  `learnchinese.ts:110-111` (free-text haystack) — both read `item.content` only.
- **What:** the list column renders joined content1..N segments
  (`getChineseReciteItemDisplayContent`), so users can see text that free text and the Content
  condition cannot match. Affects the same 10 multi-segment items as finding 3.
- **Origin:** introduced by this branch (the filter is new).
- **Suggestion:** build the searchable content from the same joined-segments helper inside
  `matchChineseListFilter`.

### 5. [Both] Race: old file's rows can be rated under the new file's contentId — status: fixed (knowledge, 2026-08-29) / open (Chinese)

- **Fix (knowledge):** `studyContentId` is now reset to 0 on file switch and only assigned in the
  content `next` handler (after the token check), so clicks on the still-visible old rows hit the
  `studyContentId <= 0` guard and are dropped; `getRatings` uses the local `contentId`. Regression
  test: "should ignore rating clicks on stale rows while the new file is loading".

- **Where:** `chinese-exercises.component.ts:340`, `knowledge-exercises.component.ts:361`
  (`this.studyContentId = selectedContent.id` before content resolves).
- **What:** on file switch, `studyContentId` is assigned immediately while the previous file's rows
  stay visible until the new content's `next`/`error`. A rating click in that window upserts
  `(newContentId, oldItemId)` — persisting a rating into the wrong file's namespace. The error path
  clears rows but cannot recall the already-issued request.
- **Probability:** narrow window (needs a slow content load plus a user click), but it is exactly
  the failure class the error-path comments guard against.
- **Suggestion:** keep `studyContentId = 0` until the content `next` arrives (or disable the rating
  toggles while a load is in flight).

### 6. [Both] Race: slow `getRatings` response can revert a fresh rating — status: fixed (knowledge, 2026-08-29) / open (Chinese)

- **Fix (knowledge):** the `next` handler overlays both the current `contentRatingMap` (covers
  already-saved clicks) and `pendingContentRatings` (covers in-flight clicks) on top of the fetched
  server list before `contentRatingMap.set`. Regression test: "should keep locally applied ratings
  when a stale getRatings response lands".

- **Where:** `chinese-exercises.component.ts:389-395`, `knowledge-exercises.component.ts:408-425`
  (the `getRatings` `next` handler rebuilding `contentRatingMap`).
- **What:** if the initial `getRatings` fetch lands *after* an early `upsertRating` succeeded, the
  map is rebuilt from the stale server list without the just-saved rating;
  `pendingContentRatings` was already deleted on the upsert's success, so nothing re-applies it and
  the toggle visually reverts to the stale server value.
- **Suggestion:** in the `next` handler, re-apply any `pendingContentRatings` entries on top of the
  fetched map before `contentRatingMap.set`.

## Minor findings

### 7. [Knowledge] Answer panel persists across prev/next — status: fixed (2026-08-29)

- **Fix:** `onPreviousItem`/`onNextItem` now also reset `showDetailAnswer`, matching the hint-flag
  handling. Regression test: "onNextItem/onPreviousItem should hide the previous item's answer
  panel".

`onPreviousItem`/`onNextItem` (`knowledge-exercises.component.ts:729-747`) reset the hint flags and
markdown but not `showDetailAnswer`, so the next item's answer is shown without pressing Toggle
Answer. Possibly intentional for studying; inconsistent with the hint handling either way.

### 8. [Knowledge] `onPreviewCore` mutates cached source rows — status: fixed (2026-08-29)

- **Fix:** the print queue is now built from shallow copies (`{ ...item, order }`, sub-items
  copied too); the `LearningContentService`-cached row objects are no longer touched. Regression
  test: "should renumber copies and leave the cached source rows untouched".

`knowledge-exercises.component.ts:632-653` renumbers `item.order` on the row objects from
`dataSource.data`, which are the `LearningContentService` per-fileUrl cached JSON objects — the
mutation persists in the cache across visits. The Chinese flow correctly renumbers freshly
converted copies (`convertChineseReciteItemToKnowledge` output) instead.

### 9. [Both] IME composition vs live filtering — status: fixed (knowledge, 2026-08-29) / open (Chinese)

- **Fix (knowledge):** the free-text input moved from `(keyup)` to `(input)` plus a
  `compositionstart`/`compositionend` guard — pinyin fragments are suppressed and the final text is
  emitted on compositionend (value read from the event target, no ngModel race). Regression test:
  "should suppress live filtering during IME composition" (list spec).

Free text applies on `(keyup)`; typing Chinese via an IME fires filtering for intermediate pinyin
fragments. Composition-aware filtering (compositionstart/end guard or `(input)`-based) would be
smoother — notable on a Chinese-content page.

### 10. [Both] List state resets when returning from detail — status: fixed (knowledge, 2026-08-29) / open (Chinese)

- **Fix (knowledge):** the list screen is no longer destroyed by the mode switch — the container
  keeps it mounted and toggles it with `[hidden]`, rendering detail/extrainfo via `@if`. Paginator
  page/size and sort state (and scroll position) now survive a detail round-trip for free; the
  `appliedFreeText`/`selectionCount` seeds remain but only matter at first construction.
  Regression test: "should keep the list screen mounted (hidden) during detail visits".

Entering detail/extra-info destroys the list child (`@switch` in
`knowledge-exercises.component.html`); returning re-creates paginator (page 0) and sort (none).
Free text and selection survive by design (`appliedFreeText` seed + `selectionCount` seed), but
page/sort do not. Cosmetic.

## Verified non-issues (checked and found correct)

- `dataSource.filter = this.dataSource.filter` self-assignment re-filter trick: safe on Material 21
  — the setter publishes to a `BehaviorSubject` unconditionally (verified in
  `@angular/material/fesm2022/table.mjs`).
- Select dialogs (both pages): count/offset clamped as defense-in-depth; By-ID no-match paste can
  neither close the dialog nor wipe the existing selection.
- Dialog Cancel semantics: seed conditions cloned; `undefined` (Cancel/backdrop/Esc) leaves state
  untouched.
- Rating toggle deselect-restore (`event.value < 1` → restore group value) and stale-upsert
  dropping via `pendingContentRatings` are sound.
- Unrated-as-0 semantics: `matchRating` compares numerically; `< 1` matches unrated, `>= 1` matches
  rated — consistent with the branch's design (`ui-common.ts`).
- Knowledge Print button disabled on empty selection; detail prev/next buttons bounds-disabled.
- Filter/selection survive list-child re-creation (free-text reseed, `selectionCount` seed).
- Focused tests passing at review time: `ng test` — 158 tests / 5 spec files
  (both page containers, `learnchinese.spec.ts`, `knowledge-list-filter.spec.ts`,
  `ui-common.spec.ts`).
