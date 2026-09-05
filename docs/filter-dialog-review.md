# Shared Filter Dialog — Code Review (filter-hierarchy contract branch)

Date: 2026-09-05
Scope: the uncommitted `chroe/keepimprv-1` changes — the editor-tree normalization
to a SINGLE top node (invisible wrapper + case-1 bare-condition boundary) in
`src/app/shared/filter-dialog/`, the four list pages migrated to the shared
dialog, the new `docs/filter-hierarchy-contract.md`, and the touched docs/i18n.

Method: multi-angle review (correctness ×3 lenses, docs, reuse, maintainability)
over the full diff, with claims verified against the actual code paths and the
actslib 0.6.83 library source (`FilterUtility.ToDefinition`/`Simplify`/`MatchFilter`);
the four `onDefineFilter` blocks were confirmed byte-identical by hash. The full
suite (44 files / 1841 tests) passed on the reviewed tree; no finding is a crash
in the normal edit → submit flow — they are contract-behavior drifts, misleading
UI copy, hardening gaps, and doc drift.

**Totals: 2 HIGH · 4 MEDIUM · 4 LOW.** The dominant theme: the invisible wrapper
node (introduced by the 2026-09-04 single-top-node normalization) shifted depth
and root/perception by one everywhere `isRoot`/`depthOf` still counted the old
visible root — H1 and H2 are both consequences of that shift.

**Progress: ALL FIXED 2026-09-05** — H1, H2, M1, M2, M3, M4, L1, L2, L3, L4
(L1/L3 pulled forward — same file as the M1 edit). Doc-only findings carry no
test runs; grep sweeps confirmed no stale claims remain.

**Final verification:** dev build clean; `ng lint` introduces no new errors or
warnings in any touched file (the one surviving warning in
`translate-exercises.component.ts:494` predates this work); full suite
**72 files / 1852 tests — all passing** (branch baseline 1841 + 11 new tests
from these fixes).

---

## HIGH

### H1. ✅ FIXED (2026-09-05) — The invisible wrapper occupies depth 1, silently tightening `maxDepth` by one level

> **Status:** Fixed in `filter-dialog.component.ts` — `canAddGroup` now calls
> `depthOf(this.root(), node.id, 0)`: the unrendered wrapper is level 0, so the
> visible top node is level 1 and `maxDepth` is exactly the deepest group level
> the toolbar offers (matching `FilterDialogData.maxDepth` and contract §1).
> The old depth-cap test (nested group at `maxDepth: 2` disabled) still passes
> unchanged; two new tests close the gap that codified the tightened cap: the
> root group CAN add a nested group at `maxDepth: 2` (the contract's flagship
> `condA AND (condB OR condC)`) and CANNOT at `maxDepth: 1`. Component spec
> green: 24 tests.

- `src/app/shared/filter-dialog/filter-dialog.component.ts:248` (`canAddGroup` →
  `depthOf(this.root(), node.id, 1) < this.maxDepth`)
- Before the wrapper normalization, the user's root group WAS the tree root and
  sat at depth 1, so `maxDepth: 4` (default) allowed root + 3 nested group
  levels. Now `seedTree` returns an invisible scaffold wrapper as the root, so
  the perceived root group sits at depth 2 — the deepest buildable group is one
  level shallower than before *and* than the documented contract
  (`FilterDialogData.maxDepth`: "deepest group level the toolbar offers;
  default 4"; `docs/filter-hierarchy-contract.md` §1: "Nesting depth is a UI
  cap ... `maxDepth` (default 4) only disables the '+ group' toolbar button at
  the deepest level").
- Scenario: a caller passes `maxDepth: 2` to cap nesting at one level. The
  contract's own flagship example `condA AND (condB OR condC)` is no longer
  expressible — the root group is at depth 2, so `2 < 2` disables "+ group"
  into it. The depth-cap spec test only asserts the nested-group case of
  `seedDef`, so it codifies the tightened cap instead of catching it.
- Fix: measure depth from the wrapper as level 0 (the wrapper is invisible and
  never a row — visible row levels start at 1 on the root node), i.e.
  `depthOf(this.root(), node.id, 0)`; add a spec asserting the root group CAN
  take a child at `maxDepth: 2` and cannot at `maxDepth: 1`, and that the
  deepest offered visible group level equals `maxDepth`.

### H2. ✅ FIXED (2026-09-05) — The ≥2-members warning blames a "non-root" group on the row the user sees as the root

> **Status:** Fixed — **message-only**, per the contract (§1 case 2: "every
> group branches — ≥2 children"; S3.2: auto-dissolve/hoist explicitly
> REJECTED — "gate + warn, no silent edits"), so the validation itself was
> correct and unchanged: `common.filterGroupNeedsTwo` is now position-neutral
> ("A condition group needs at least two members" / "条件组至少需要两个成员",
> en + zh; the dead `vocabularyExercises.*` copy is left for L4 to delete),
> and the stale taxonomy comments were rewritten — `validateTree`'s doc block,
> the `FilterTreeValidation.invalidGroupIds` field, the component class doc,
> and the model-spec test title ("the wrapper's exemption is STRUCTURAL;
> every rendered group, the top row included, must branch"). No behavior
> change; both filter-dialog specs green: 66 tests.

- `src/app/shared/filter-dialog/filter-dialog.component.html:40,78` + the
  string itself `common.filterGroupNeedsTwo` (`en.json:75`, `zh-CN.json:75`):
  "A non-root condition group needs at least two members".
- `validateTree` still exempts only the wrapper (`walk(root, true)`), so the
  single top GROUP node is flagged through the nested-group path. The flagging
  is contract-correct; the message is not — on the root row it tells the user
  about a group that "isn't root" while they are looking at the only row that
  IS the root, and the detail-pane error repeats it.
- Scenario (documented growth path): delete to the empty tree → "+ group" →
  the single root group row warns "A **non-root** condition group needs at
  least two members". Same after building `(A AND B)` and deleting `B`.
- Fix: make the string position-neutral — "A condition group needs at least
  two members" (en/zh) — and update the stale comments that still describe the
  pre-normalization taxonomy: the `validateTree` doc block ("The root is
  exempt ... 1 member is a plain single-condition filter" — that was the old
  visible-root framing), `FilterTreeValidation.invalidGroupIds` ("root
  exempt"), and the model-spec test title.

---

## MEDIUM

### M1. ✅ FIXED (2026-09-05) — A definition-shaped root missing `conditions` throws instead of degrading to case 0

> **Status:** Fixed in `filter-dialog-model.ts` — a shared `membersOf(def)`
> helper (`def.conditions ?? []`) now backs every walk over a caller's
> definition: `hasActiveFilterDefinition`, `seedTree` (`seedNode`/`seedTop`),
> `foldEnumOrGroup`, and `summarizeFilterDefinition` (`foldEnumParts` /
> `renderGroup`), mirroring actslib's own `Simplify`/`MatchFilter` treatment
> of a missing `conditions` as empty. A JSON-decoded `{ join }` seed now
> degrades to case 0 (inactive menu state, empty scaffold, empty summary)
> instead of throwing during change detection. Covered by 3 new tests in the
> model spec ("a definition missing the conditions key (M1)", root + nested
> cases). Model spec green: 45 tests.

- `src/app/shared/filter-dialog/filter-dialog-model.ts` —
  `hasActiveFilterDefinition` (:240 `root.conditions.some`), `seedTop`
  (:366 `current.conditions.length`), `foldEnumOrGroup` (:277), and
  `summarizeFilterDefinition`'s `foldEnumParts`/`renderGroup` loops, all
  dereference `.conditions` unguarded. actslib's own `MatchFilter` treats a
  missing `conditions` as empty (`Simplify` guards with
  `definition.conditions && ...`), so `{ join: 'OR' }` — a legal decode from
  persisted/URL-restored JSON — matches all rows server-side but crashes the
  page that renders its menu label, or crashes `seedTree` when opening the
  dialog.
- Fix: one internal `membersOf(def)` helper (`def.conditions ?? []`) used by
  every walk, so a malformed seed degrades to case 0 / match-all consistently.

### M2. ✅ FIXED (2026-09-05) — `docs/vocabulary-exercises-architecture.md` still documents the OLD submit contract

> **Status:** Fixed — §7.3 now documents Submit `{ root: FilterRoot }` (bare
> `IFilterCondition` for a single-condition filter via `Simplify`), the
> single-top-node editor tree with the invisible wrapper, the corrected
> validation wording (every rendered group branches, top GROUP row included;
> empty tree not submittable — Clear Filter owns case 0), and the `maxDepth`
> semantics as fixed in H1; §8 / §8.1 / the §10.5 model snippets now use
> `FilterRoot` (verified against `interfaces/vocabulary.ts:268` and the actslib
> `IFilterDefinition` declaration — `conditions` is REQUIRED, so the guard in
> M1 is runtime hardening for JSON decodes, not a type change); the signal
> table row (:120) reads `signal<FilterRoot>`. Grep confirms no
> `IFilterDefinition`-only submit claims remain. Doc-only; no tests affected.

- The as-built reference (designated by CLAUDE.md and cross-referenced by
  `docs/filter-hierarchy-contract.md` §5) still says Submit returns
  `{ root: IFilterDefinition }` (§7, ~:405), `root: IFilterDefinition` in the
  `VocabularyListFilter` snippets (:420, :552), and `filterDefinition =
  signal<IFilterDefinition>` (:120) — untouched by this diff.
- Failure scenario: a maintainer wiring the next consumer (filter persistence,
  a fifth page) follows it literally and dereferences `result.root.conditions`
  on the dialog result — a single-condition filter now crosses the boundary as
  a bare `IFilterCondition` with no `conditions` field → TypeError at runtime.
- Fix: update those sections to the `FilterRoot` contract (bare condition for
  case 1 via `Simplify`; `filterDefinition` signals typed `FilterRoot`).

### M3. ✅ FIXED (2026-09-05) — `docs/reusable-filter-dialog-design.md` body still teaches the DELETED invariants

> **Status:** Fixed — the body now matches the appended correction bullets:
> D7 rewritten ("root exempt" is now STRUCTURAL, covering only the invisible
> wrapper; every rendered group must branch; case 0 not submittable); §9's
> intro states the three-case taxonomy (contract §1) and the full gate
> `canSubmit = !emptyTree && noMissingValue && noInvalidGroups`; §6.2's
> `seedTree`/`emitTree` rows rewritten (single-top-node normalization; the
> page never receives `conditions: []` from the dialog — the empty-root
> emission is scoped to the pure function); §13's test-strategy line scoped
> likewise; the `maxDepth` bullet now states the H1-corrected visible-level
> semantics; and the status header reads "all four list pages migrated
> (Phases 1–5)" instead of "Phases 3–5 pending" (a same-class drift the
> review's grep pass surfaced). Doc-only; grep sweep clean.

- The diff appended correction bullets at the top but left the body: §9 "root
  exempt: 0 = clear-filter" (:438), D7 "root exempt" (:119), the `emitTree`
  contract row "root may emit `conditions: []` (= match-all = cleared
  filter)" (:290), and the required invariant "empty root → `conditions:
  []`" (:563) — all contradicting the new gate (case 0 is not submittable;
  one-line spec assertions for the old behavior were deleted in this diff).
- Failure scenario: someone implementing/testing `validateTree` from §9 writes
  `expect(validateTree(rootOf(), schema).canSubmit).toBe(true)` — the exact
  assertion this diff removed — and gets RED; or "fixes" the code to match §9,
  reopening the path where an emptied tree silently installs a match-all
  filter from inside the dialog, bypassing the Clear Filter button that owns
  case 0.
- Fix: rewrite the stale sections to the three-case taxonomy (contract §1).

### M4. ✅ FIXED (2026-09-05) — The dialog-open block and the empty-definition factory each have four owners

> **Status:** Fixed — new `src/app/shared/filter-dialog/filter-dialog-launcher.ts`
> exports `FILTER_DIALOG_CONFIG` + `openFilterDialog()` (seed wiring, the
> standard sizing/animation config, the `takeUntilDestroyed` subscription and
> the Cancel guard, all once), and a single `emptyFilterDefinition()` now
> lives in `filter-dialog-model.ts` (barrel-exported). All four containers'
> `onDefineFilter` collapse to an 8-line launcher call; the four
> `emptyXFilterDefinition()` factories are deleted from `interfaces/` (with
> their now-unused `FilterJoinType`/`IFilterDefinition` imports) and
> `vocabulary.spec.ts` inlines the case-0 literal. The design doc §10 page-side
> snippet (still showing the old `width: '880px'` hand-rolled form) was
> updated to the launcher shape. New `filter-dialog-launcher.spec.ts` (4
> tests: config/seed pass-through, `maxDepth`/`titleKey` overrides, Submit →
> `onApplied`, Cancel → untouched). Dev build clean; the four page specs +
> `vocabulary.spec` + launcher spec green: 426 tests.

- The 28-line `onDefineFilter` block is byte-identical across all four
  containers (vocabulary :320, knowledge, chinese, translate), as are the four
  `emptyXFilterDefinition()` factories in the interface files
  (`{ join: AND, conditions: [] }`). Every viewport/animation/result-handling
  tweak (this diff itself fanned the `width: '1100px'` pair into four files) is
  a 4-file edit, and a missed page silently diverges; a fifth page
  copy-pasting can drop the `result !== undefined` guard (Cancel must keep the
  old filter) with no compile error.
- Fix: export `openFilterDialog()` (standard config + seed + Cancel-guard +
  `onApplied` callback) and one `emptyFilterDefinition()` from the shared
  filter-dialog barrel; pages keep only their 5-line wiring, the interface
  factories are deleted.

---

## LOW

### L1. ✅ FIXED (2026-09-05) — `summarizeFilterDefinition`'s ellipsis can split a surrogate pair

> **Status:** Fixed — the cap now slices by code point
> (`Array.from(joined).slice(0, maxLength - 1).join('')`), so an astral-plane
> character at the cut lands whole-or-dropped, never half. Covered by 1 new
> model-spec test ("the ellipsis cut never splits a surrogate pair (L1)")
> using CJK Ext-B `𠀋` positioned exactly at the old UTF-16 cut; the existing
> BMP cap test still passes unchanged. Model spec green: 46 tests.

- `filter-dialog-model.ts:827` slices by UTF-16 code unit. A menu summary
  longer than `FILTER_MENU_MAX_LENGTH` containing an astral-plane character
  (e.g. CJK Extension B `𠀋`) cuts between the surrogates → the label renders
  `U+FFFD` ("?").
- Fix: code-point-safe slice (`Array.from`/spread), assert in the cap test.

### L2. ✅ FIXED (2026-09-05) — The toolbar delete button is always labeled "Remove group", even for a condition

> **Status:** Fixed — `deleteSelectedLabelKey()` on the component returns
> `common.removeFilterCondition` when the selected node is a leaf and
> `common.removeFilterGroup` otherwise (group, or the disabled no-selection
> state); the button's `aria-label`/`title` follow it, and the new
> `common.removeFilterCondition` ("Remove condition" / "删除条件") was added to
> the `common` block of both locale files. Covered by 1 new component-spec
> test asserting both wordings. Component spec green: 25 tests.

- `filter-dialog.component.html:21-22` keeps `common.removeFilterGroup`
  although the kind-armed toolbar made this button the ONLY delete affordance
  for plain conditions too — including the blank condition every "new filter"
  dialog opens with. Screen-reader users hear "Remove group" to delete a
  condition.
- Fix: label by selected kind (new `common.removeFilterCondition`, en "Remove
  condition" / zh "删除条件"; group keeps the existing key).

### L3. ✅ FIXED (2026-09-05) — The bare-condition wrap hand-copies actslib's `ToDefinition` while Submit uses the real `Simplify`

> **Status:** Fixed — `summarizeFilterDefinition` now calls
> `FilterUtility.ToDefinition(root)` (actslib `FilterUtility.ts:207`), the
> library inverse of the `Simplify` used at Submit, so the two boundary
> conversions can no longer drift apart. Behavior-identical (verified:
> `ToDefinition` returns `{ conditions: [c] }` for a bare condition and the
> definition untouched otherwise) — the existing "renders a bare condition
> (case 1) like its wrapper" spec guards it. Model spec green: 46 tests.

- `filter-dialog-model.ts:773` (`isFilterCondition(root) ? { conditions: [root] } : root`)
  re-implements `FilterUtility.ToDefinition` (actslib `FilterUtility.ts:207`)
  verbatim. The pair `ToDefinition`/`Simplify` evolves together in actslib;
  Submit follows the library, this copy does not — after a spelling change the
  menu label/preview would describe a different shape than `MatchFilter`
  evaluates.
- Fix: `const def = FilterUtility.ToDefinition(root)` (import the value).

### L4. ✅ FIXED (2026-09-05) — Eleven orphaned filter keys left under `vocabularyExercises.*`

> **Status:** Fixed — the eleven dead scoped copies (`filterGroup`,
> `filterJoinHint`, `filterJoinSelect`, `addFilterGroup`,
> `removeFilterGroup`, `filterGroupNeedsTwo`, `filterCondition`,
> `filterDetailEmpty`, `filterSplitter`, `filterPreview`,
> `filterPreviewEmpty`) deleted from the `vocabularyExercises` block of both
> locale files, after a per-key reference sweep (zero non-shared uses in
> `.ts`/`.html`); `wordOpIsPhrase` KEPT (live `labelKey`,
> `interfaces/vocabulary.ts:193`) and `editWordFilter` kept (dead but the
> scoped `editXFilter` title-key convention; see note below). Both files
> parse as valid JSON; a grep for the deleted names now returns exactly 12
> hits per file, all the live `common.*` owners. (The per-key reference sweep
> also confirmed `editWordFilter` is unreferenced — kept, consistent with the
> other pages' scoped `editXFilter` title-key convention; flagged there for a
> future i18n sweep.)

- `en.json:189-199` / `zh-CN.json:146+`: `filterGroup`, `filterJoinHint`,
  `filterJoinSelect`, `addFilterGroup`, `removeFilterGroup`,
  `filterGroupNeedsTwo`, `filterCondition`, `filterDetailEmpty`,
  `filterSplitter`, `filterPreview`, `filterPreviewEmpty` — leftovers of the
  deleted per-page dialog (the shared dialog reads only `common.*`;
  verified zero references). This diff had to update `filterDetailEmpty` in
  FOUR places (common + dead copy × en + zh) to stay consistent — dead config
  that looks live.
- Fix: delete the eleven verified-dead copies (keep `wordOpIsPhrase`); greps
  for these keys then return only the live `common.*` owners.

---

## Notes (reviewed, no action)

- The core paths (`seedTop` normalization, `onDeleteSelected` selection
  return, `buildInitialTree` scaffolding, the four pages' filter pipelines)
  were traced clean by three independent correctness angles; the
  `Simplify`-at-boundary round-trip (`emit → seed → emit` + `Simplify`) is
  covered by the model spec.
- The one finder that reported against already-merged commit `e01e504`
  (Angular 22 upgrade) was outside this diff's scope and discarded.
